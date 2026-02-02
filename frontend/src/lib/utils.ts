/**
 * Merge class names (e.g. for conditional styling).
 * Install clsx + tailwind-merge for full shadcn-style cn().
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
