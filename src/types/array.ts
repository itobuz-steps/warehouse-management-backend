export const safeFirst = <T>(arr: T[], fallback: T): T =>
  arr.length ? arr[0] : fallback;
