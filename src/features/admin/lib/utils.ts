import { ValidContentType } from "@/constants/types";
import { uploadToR2 } from "../server/actions";
import {
  FAILED_TO_UPLOAD_IMAGE,
  TOPICAL_QUESTION_APP_ROUTE,
  UNAUTHORIZED,
} from "@/constants/constants";
import { redirect } from "next/navigation";

export const uploadImage = async ({
  file,
  subjectFullName,
  paperCode,
  contentType,
  curriculumName,
  questionNumber,
  order,
}: {
  file: File;
  subjectFullName: string;
  paperCode: string;
  contentType: ValidContentType;
  curriculumName: string;
  questionNumber: string;
  order: number;
}): Promise<{
  success: boolean;
  error?: string;
  data?: { imageSrc: string };
}> => {
  const filename = `${curriculumName};${subjectFullName};${paperCode};${contentType};${questionNumber};${order}`;
  const form = new FormData();
  form.append("key", filename);
  form.append("body", file);
  form.append(
    "options",
    JSON.stringify({
      httpMetadata: {
        contentType: file.type,
      },
    })
  );

  const response = await uploadToR2({ formData: form });

  if (!response.success) {
    const error = response.error;
    if (error === UNAUTHORIZED) {
      redirect(TOPICAL_QUESTION_APP_ROUTE);
    } else {
      return {
        success: false,
        error: error ?? FAILED_TO_UPLOAD_IMAGE,
      };
    }
  }

  return {
    success: true,
    data: {
      imageSrc: response.data?.imageSrc ?? "",
    },
  };
};
