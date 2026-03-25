export function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try {
            return JSON.parse(tags);
        } catch {
            // Handle PostgreSQL array format: {Hiking,Beach}
            return tags.replace(/[{}]/g, '').split(',').filter(Boolean);
        }
    }
    return [];
};
