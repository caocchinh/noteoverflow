import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { convertImageToPngBase64, splitContent } from "./utils";
import {
  extractPaperCode,
  extractQuestionNumber,
  generatePastPaperLinks,
} from "./utils";
import { PDF_HEADER_LOGO_SRC } from "../constants/constants";
import ExportPdfTemplate from "../components/QuestionPdfTemplate";
import { SelectedQuestion } from "../constants/types";

export type PdfContentType = "question" | "answer" | "question-with-answers";

interface QuestionPdfData {
  questionItem: {
    images: string[];
    text: string[];
  };
  answerItem: {
    images: string[];
    text: string[];
  };
  paperCode: string;
  questionLink: string;
  answerLink: string;
  questionNumber: string;
}

/**
 * Prepares a single question's data for PDF generation.
 * Converts images to base64 and extracts paper codes/links.
 */
async function prepareQuestionForPdf(
  question: SelectedQuestion,
  typeOfContent: PdfContentType
): Promise<QuestionPdfData> {
  const questionItem: { images: string[]; text: string[] } = {
    images: [],
    text: [],
  };
  const answerItem: { images: string[]; text: string[] } = {
    images: [],
    text: [],
  };

  // Extract question content if needed
  if (
    typeOfContent === "question" ||
    typeOfContent === "question-with-answers"
  ) {
    const { images, text } = splitContent(question.questionImages);
    questionItem.images.push(...images);
    questionItem.text.push(...text);
  }

  // Extract answer content if needed
  if (typeOfContent === "answer" || typeOfContent === "question-with-answers") {
    const { images, text } = splitContent(question.answers);
    answerItem.images.push(...images);
    answerItem.text.push(...text);
  }

  // Convert images to base64
  const [convertedQuestionImages, convertedAnswerImages] = await Promise.all([
    Promise.all(
      questionItem.images.map((imgUrl) => convertImageToPngBase64(imgUrl))
    ),
    Promise.all(
      answerItem.images.map((imgUrl) => convertImageToPngBase64(imgUrl))
    ),
  ]);

  questionItem.images = convertedQuestionImages;
  answerItem.images = convertedAnswerImages;

  // Extract paper metadata
  const paperCode = extractPaperCode({ questionId: question.id });
  const questionNumber = extractQuestionNumber({ questionId: question.id });
  const { questionLink, answerLink } = generatePastPaperLinks({
    questionId: question.id,
    paperCode,
  });

  return {
    questionItem,
    answerItem,
    paperCode,
    questionLink,
    answerLink,
    questionNumber: questionNumber.toString(),
  };
}

/**
 * Loads the header logo as base64.
 */
async function loadHeaderLogo(): Promise<string | null> {
  try {
    return await convertImageToPngBase64(PDF_HEADER_LOGO_SRC);
  } catch (error) {
    console.error("Failed to load header logo", error);
    return null;
  }
}

/**
 * Generates a PDF blob for a single question.
 * Used in AnnotatableInspectImages for individual question export.
 */
export async function generateSingleQuestionPdfBlob({
  question,
  typeOfContent,
}: {
  question: SelectedQuestion;
  typeOfContent: PdfContentType;
}): Promise<Blob | null> {
  try {
    const [questionData, headerLogo] = await Promise.all([
      prepareQuestionForPdf(question, typeOfContent),
      loadHeaderLogo(),
    ]);

    return await pdf(
      <ExportPdfTemplate
        questions={[questionData]}
        headerLogo={headerLogo || ""}
      />
    ).toBlob();
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Progress callback type for bulk export.
 */
export type ExportProgressCallback = (current: number, total: number) => void;

/**
 * Processes items in batches to avoid overwhelming the browser.
 */
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
  onProgress?: (completed: number, total: number) => void,
  signal?: AbortSignal
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += batchSize) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, total), total);
    }
  }

  return results;
}

export async function generateMultipleQuestionsPdfBlob({
  questions,
  typeOfContent,
  onProgress,
  signal,
}: {
  questions: SelectedQuestion[];
  typeOfContent: PdfContentType;
  onProgress?: ExportProgressCallback;
  signal?: AbortSignal;
}): Promise<Blob | null> {
  if (questions.length === 0) {
    return null;
  }

  // Batch size for PDF generation (how many questions per temporary PDF)
  // 25 is safe enough to avoid memory crashes while keeping overhead manageable
  const PDF_GENERATION_CHUNK_SIZE = 12;

  // Concurrency for processing images within a chunk
  const IMAGE_PROCESSING_CONCURRENCY = 3;

  try {
    // Load header logo first
    const headerLogo = await loadHeaderLogo();

    // Create a new PDF document to merge into
    const mergedPdf = await PDFDocument.create();

    const totalQuestions = questions.length;
    let processedCount = 0;
    const chunkBlobs: Blob[] = [];

    // Process questions in chunks
    for (let i = 0; i < totalQuestions; i += PDF_GENERATION_CHUNK_SIZE) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const chunkQuestions = questions.slice(i, i + PDF_GENERATION_CHUNK_SIZE);

      // Prepare data for this chunk
      // We still use processInBatches for image processing to control concurrency
      const chunkData = await processInBatches(
        chunkQuestions,
        IMAGE_PROCESSING_CONCURRENCY,
        (question) => prepareQuestionForPdf(question, typeOfContent),
        (batchCompleted) => {
          if (onProgress) {
            onProgress(processedCount + batchCompleted, totalQuestions);
          }
        },
        signal
      );

      // Generate PDF blob for this chunk
      const chunkBlob = await pdf(
        <ExportPdfTemplate
          questions={chunkData}
          headerLogo={headerLogo || ""}
        />
      ).toBlob();

      // Load the chunk PDF into pdf-lib
      // Store the chunk PDF blob
      chunkBlobs.push(chunkBlob);

      // Update progress
      processedCount += chunkQuestions.length;
    }

    // Merge all chunks into the final document
    for (const chunkBlob of chunkBlobs) {
      const chunkPdfDoc = await PDFDocument.load(await chunkBlob.arrayBuffer());
      const copiedPages = await mergedPdf.copyPages(
        chunkPdfDoc,
        chunkPdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}
