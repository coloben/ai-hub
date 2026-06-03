/** Strip HTML and control chars from user-generated text */
export function sanitizeText(input: string, maxLen: number): string {
  const stripped = input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
  return stripped.slice(0, maxLen)
}
