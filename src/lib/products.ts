export function parseProductFeatures(product: {
  meta?: string | null;
  description?: string | null;
}): string[] {
  if (product.meta) {
    const raw = product.meta.trim();
    if (raw) {
      const delimiterRegex = /[·•|\n;]|\s+[/]\s+/;
      if (delimiterRegex.test(raw)) {
        const items = raw
          .split(delimiterRegex)
          .map((item) => item.replace(/^(?:[-*•]|\d+[.)])\s*/, "").trim())
          .filter(Boolean);
        if (items.length > 0) return items;
      }

      if (raw.includes(",")) {
        const items = raw
          .split(",")
          .map((item) => item.replace(/^(?:[-*•]|\d+[.)])\s*/, "").trim())
          .filter(Boolean);
        if (items.length > 1) return items;
      }

      const single = raw.replace(/^(?:[-*•]|\d+[.)])\s*/, "").trim();
      if (single) return [single];
    }
  }

  if (product.description) {
    const lines = product.description
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const bulletLines = lines.filter((line) => /^[-*•]\s+/.test(line));
    if (bulletLines.length > 0) {
      return bulletLines.map((line) => line.replace(/^[-*•]\s+/, "").trim());
    }
  }

  return [];
}
