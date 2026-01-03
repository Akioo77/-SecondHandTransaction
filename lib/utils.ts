import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageSrc(images?: string): string | null {
  if (!images || images.trim() === "") return null

  // Already a data URI (data:image/xxx;base64,...)
  if (images.startsWith("data:")) {
    return images
  }

  // HTTP URL
  if (images.startsWith("http://") || images.startsWith("https://")) {
    return images
  }

  // Pure base64 string - assume it's PNG if no type info
  return `data:image/png;base64,${images}`
}
