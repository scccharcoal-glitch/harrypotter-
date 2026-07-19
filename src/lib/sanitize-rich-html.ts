import sanitizeHtml from "sanitize-html";
import { EXTERNAL_LINK_REL, isExternalLink } from "@/lib/external-links";

export function sanitizeRichHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attributes) => {
        const safeAttributes = { ...attributes };
        delete safeAttributes.target;
        delete safeAttributes.rel;
        const href = safeAttributes.href ?? "";

        return {
          tagName: "a",
          attribs: isExternalLink(href)
            ? { ...safeAttributes, target: "_blank", rel: EXTERNAL_LINK_REL }
            : safeAttributes,
        };
      },
    },
  });
}
