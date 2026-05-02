export function capitalize(input: string | null | undefined): string {
  if (!input) return "";
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function titleCase(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
