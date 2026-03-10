/**
 * Slugify a string into a URL-safe format.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled";
}

/**
 * Build a Notion-style slug URL for a page.
 * Format: /pages/my-page-title-{uuidWithoutDashes}
 */
export function pageUrl(id: string, title: string): string {
  return `/pages/${slugify(title)}-${id.replace(/-/g, "")}`;
}

/**
 * Build a Notion-style slug URL for a group.
 * Format: /groups/my-group-name-{uuidWithoutDashes}
 */
export function groupUrl(id: string, name: string): string {
  return `/groups/${slugify(name)}-${id.replace(/-/g, "")}`;
}

/**
 * Extract the UUID from a slug.
 * Handles both slug format (ends in 32 hex chars) and bare UUID format (backwards compat).
 * Returns null if no valid UUID can be found.
 */
export function extractUuid(slug: string): string | null {
  // Slug format: my-title-{32hexchars}
  const hexMatch = slug.match(/([0-9a-f]{32})$/i);
  if (hexMatch) {
    const h = hexMatch[1].toLowerCase();
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  // Bare UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidMatch = slug.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (uuidMatch) return uuidMatch[1].toLowerCase();
  return null;
}
