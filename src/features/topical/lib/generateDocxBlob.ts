import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle,
} from "docx";
import {
  convertImageToPngBase64WithDimensions,
  splitContent,
  extractPaperCode,
  extractQuestionNumber,
  generatePastPaperLinks,
} from "./utils";
import { SelectedQuestion } from "../constants/types";
import { PdfContentType } from "./generatePdfBlob";
import { PDF_HEADER_LOGO_SRC } from "../constants/constants";

function dataURLToUint8Array(dataURL: string): Uint8Array {
  const base64 = dataURL.split(",")[1] || dataURL;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Prepares data for a single question for DOCX generation.
 */
async function prepareQuestionForDocx(
  question: SelectedQuestion,
  typeOfContent: PdfContentType
) {
  const customQuestionItem: { images: string[]; text: string[] } = {
    images: [],
    text: [],
  };
  const customAnswerItem: { images: string[]; text: string[] } = {
    images: [],
    text: [],
  };

  if (
    typeOfContent === "question" ||
    typeOfContent === "question-with-answers"
  ) {
    const { images, text } = splitContent(question.questionImages);
    customQuestionItem.images.push(...images);
    customQuestionItem.text.push(...text);
  }

  if (typeOfContent === "answer" || typeOfContent === "question-with-answers") {
    const { images, text } = splitContent(question.answers);
    customAnswerItem.images.push(...images);
    customAnswerItem.text.push(...text);
  }

  // Convert images to base64 with dimensions
  const [questionImagesData, answerImagesData] = await Promise.all([
    Promise.all(
      customQuestionItem.images.map((imgUrl) =>
        convertImageToPngBase64WithDimensions(imgUrl)
      )
    ),
    Promise.all(
      customAnswerItem.images.map((imgUrl) =>
        convertImageToPngBase64WithDimensions(imgUrl)
      )
    ),
  ]);

  const paperCode = extractPaperCode({ questionId: question.id });
  const questionNumber = extractQuestionNumber({ questionId: question.id });
  const { questionLink, answerLink } = generatePastPaperLinks({
    questionId: question.id,
    paperCode,
  });

  return {
    questionItem: {
      text: customQuestionItem.text,
      images: questionImagesData,
    },
    answerItem: {
      text: customAnswerItem.text,
      images: answerImagesData,
    },
    paperCode,
    questionNumber: questionNumber.toString(),
    questionLink,
    answerLink,
  };
}

export async function generateMultipleQuestionsDocxBlob({
  questions,
  typeOfContent,
  onProgress,
  signal,
}: {
  questions: SelectedQuestion[];
  typeOfContent: PdfContentType;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<Blob | null> {
  if (questions.length === 0) return null;

  try {
    const totalQuestions = questions.length;
    const children: Paragraph[] = [];

    // Add Logo
    try {
      const logoData = await convertImageToPngBase64WithDimensions(
        PDF_HEADER_LOGO_SRC
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: dataURLToUint8Array(logoData.base64),
              transformation: {
                width: 200,
                height: (200 / logoData.width) * logoData.height,
              },
            } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    } catch (e) {
      console.error("Failed to load logo for DOCX", e);
    }

    let processedCount = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < totalQuestions; i += BATCH_SIZE) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const batch = questions.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((q) => prepareQuestionForDocx(q, typeOfContent))
      );

      for (const data of batchResults) {
        // Add Separator Line
        children.push(
          new Paragraph({
            text: "",
            border: {
              bottom: {
                color: "E5E7EB",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { after: 200, before: 200 },
          })
        );

        // Metadata: Paper Code and Question Number with Links
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.paperCode} | Q${data.questionNumber}`,
                bold: true,
                size: 24, // 12pt
              }),
            ],
            spacing: { after: 100 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Links: ",
                italics: true,
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "Question Paper",
                    style: "Hyperlink",
                  }),
                ],
                link: data.questionLink,
              }),
              new TextRun({ text: " | " }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "Mark Scheme",
                    style: "Hyperlink",
                  }),
                ],
                link: data.answerLink,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        // Question Content
        if (
          data.questionItem.text.length > 0 ||
          data.questionItem.images.length > 0
        ) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "Question:", bold: true, size: 22 }),
              ],
              spacing: { after: 100 },
            })
          );

          data.questionItem.text.forEach((text) => {
            children.push(
              new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 100 },
              })
            );
          });

          data.questionItem.images.forEach((imgData) => {
            // Scale down if too wide (e.g. > 600px)
            let width = imgData.width;
            let height = imgData.height;
            const MAX_WIDTH = 600;
            if (width > MAX_WIDTH) {
              const ratio = MAX_WIDTH / width;
              width = MAX_WIDTH;
              height = height * ratio;
            }

            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: dataURLToUint8Array(imgData.base64),
                    transformation: {
                      width: width,
                      height: height,
                    },
                  } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
                ],
                spacing: { after: 200 },
              })
            );
          });
        }

        // Answer Content
        if (
          data.answerItem.text.length > 0 ||
          data.answerItem.images.length > 0
        ) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer:",
                  bold: true,
                  size: 22,
                  color: "008000",
                }),
              ],
              spacing: { before: 200, after: 100 },
            })
          );

          data.answerItem.text.forEach((text) => {
            children.push(
              new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 100 },
              })
            );
          });

          data.answerItem.images.forEach((imgData) => {
            let width = imgData.width;
            let height = imgData.height;
            const MAX_WIDTH = 600;
            if (width > MAX_WIDTH) {
              const ratio = MAX_WIDTH / width;
              width = MAX_WIDTH;
              height = height * ratio;
            }

            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: dataURLToUint8Array(imgData.base64),
                    transformation: {
                      width: width,
                      height: height,
                    },
                  } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
                ],
                spacing: { after: 200 },
              })
            );
          });
        }
      }

      processedCount += batch.length;
      onProgress?.(processedCount, totalQuestions);
    }

    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return null;
  }
}
