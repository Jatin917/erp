import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function parseUrl(url:string){
  const parsedUrl =`${import.meta.env.VITE_BACKEND_URL_STATIC}/${url.replace(
      /\\/g,
      "/"
    )}`;
  return parsedUrl;
}