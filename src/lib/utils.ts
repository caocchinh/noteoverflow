import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  console.log(CloudflareEnv.)
  return twMerge(clsx(inputs))
}
