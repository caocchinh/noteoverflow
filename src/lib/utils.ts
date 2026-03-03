import { ValidSeason } from "@/constants/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseQuestionId = ({
  curriculumName,
  subject,
  paperCode,
  questionNumber,
}: {
  curriculumName: string;
  subject: string;
  paperCode: string;
  questionNumber: string;
}): string => {
  return `${curriculumName};${subject};${paperCode};questions;Q${questionNumber}`;
};

export const isValidQuestionId = (id: string): boolean => {
  const questionIdRegex = /^[^;]+;[^;]+;[^;]+;questions;Q.+$/;
  return questionIdRegex.test(id);
};

export function isEmbeddedBrowser() {
  const userAgent = navigator.userAgent || "";
  const embeddedBrowserPatterns = [
    "FBAN",
    "FBAV",
    "Instagram",
    "TikTok",
    "Snapchat",
    "Twitter",
    "Line",
    "WeChat",
    "QQBrowser",
  ];
  const embeddedBrowserRegex = new RegExp(embeddedBrowserPatterns.join("|"), "i");
  return embeddedBrowserRegex.test(userAgent);
}

export const isAppleDevice = () => {
  if (typeof window === "undefined") return false;

  const isAppleVendor = /apple/i.test(navigator.vendor);
  const isApplePlatform = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
  const isAppleUserAgent = /Mac|iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    isAppleVendor ||
    isApplePlatform ||
    isAppleUserAgent ||
    navigator.platform === "MacIntel" ||
    navigator.userAgent.includes("Macintosh")
  );
};

export const openInExternalBrowser = (url: string) => {
  // iOS
  if (isAppleDevice()) {
    window.location.href = `x-safari-${url}`;
    return;
  } else {
    window.location.href = `intent:${url}#Intent;package=com.android.chrome;end`;
    return;
  }
};

export const getShortSeason = ({
  season,
  verbose,
}: {
  season: ValidSeason;
  verbose: boolean;
}): string | undefined => {
  if (season === "Summer") {
    return verbose ? "M/J" : "s";
  } else if (season === "Winter") {
    return verbose ? "O/N" : "w";
  } else if (season === "Spring") {
    return verbose ? "M/J" : "m";
  }
  return undefined;
};

/**
 * Fetch image from URL and convert to base64
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to base64
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
