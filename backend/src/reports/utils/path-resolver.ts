/** Walk a nested object using a relation path from registry config. */
export const getValueByPath = (root: unknown, path: string[]): unknown => {
  let current: unknown = root;
  for (const segment of path) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[segment];
  }
  return current ?? null;
};

export const serializeFieldValue = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
};
