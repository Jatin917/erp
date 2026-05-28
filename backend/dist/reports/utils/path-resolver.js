/** Walk a nested object using a relation path from registry config. */
export const getValueByPath = (root, path) => {
    let current = root;
    for (const segment of path) {
        if (current == null || typeof current !== "object")
            return null;
        current = current[segment];
    }
    return current ?? null;
};
export const serializeFieldValue = (value) => {
    if (value instanceof Date)
        return value.toISOString();
    if (value === undefined)
        return null;
    return value;
};
//# sourceMappingURL=path-resolver.js.map