import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toValidGuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const hexPart1 = Math.abs(hash).toString(16).padStart(8, "0");
  let hash2 = 5381;
  for (let i = 0; i < id.length; i++) {
    hash2 = (hash2 * 33) ^ id.charCodeAt(i);
    hash2 |= 0;
  }
  const hexPart2 = Math.abs(hash2).toString(16).padStart(8, "0");
  const hexCombined = (hexPart1 + hexPart2 + "0000000000000000").slice(0, 32);

  return `${hexCombined.slice(0, 8)}-${hexCombined.slice(8, 12)}-4${hexCombined.slice(13, 16)}-8${hexCombined.slice(17, 20)}-${hexCombined.slice(20, 32)}`;
}

