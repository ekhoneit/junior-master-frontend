/**
 * Universal helper to resolve product thumbnail image
 * Supports:
 * 1. String URL in product.image
 * 2. Array of image URLs/objects in product.images
 * 3. JSON stringified array in product.images
 * 4. Fallback to first available variant image in product.productVariants
 * 5. Optional fallback URL
 */
export function getProductThumbnail(product, fallback = null) {
    if (!product) return fallback;

    // 1. Direct single image
    if (typeof product.image === "string" && product.image.trim()) {
        return product.image.trim();
    }

    // 2. Direct array of images
    if (Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images[0];
        if (typeof first === "string" && first.trim()) return first.trim();
        if (first && typeof first === "object" && first.url) return first.url;
    }

    // 3. JSON string representation of images
    if (typeof product.images === "string" && product.images.trim()) {
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                if (typeof first === "string" && first.trim()) return first.trim();
                if (first && typeof first === "object" && first.url) return first.url;
            } else if (typeof parsed === "string" && parsed.trim()) {
                return parsed.trim();
            }
        } catch {
            if (
                product.images.startsWith("http://") ||
                product.images.startsWith("https://") ||
                product.images.startsWith("/")
            ) {
                return product.images.trim();
            }
        }
    }

    // 4. Fallback to variant image
    if (Array.isArray(product.productVariants) && product.productVariants.length > 0) {
        const variantWithImg = product.productVariants.find(v => v?.image && typeof v.image === "string" && v.image.trim());
        if (variantWithImg?.image) return variantWithImg.image.trim();
    }

    // 5. Check product.thumbnail
    if (typeof product.thumbnail === "string" && product.thumbnail.trim()) {
        return product.thumbnail.trim();
    }

    return fallback;
}
