import { apiClient } from "@/lib/apiClient";
import { MOCK_JUNIOR_MASTER_PRODUCTS } from "@/lib/mockJuniorMasterData";

export async function getProducts(filters = {}, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const res = await apiClient(`/api/product?${params.toString()}`, {
      tags: ["products"],
      revalidate: 15,
    });
    if (res?.products && Array.isArray(res.products)) return res;
    if (Array.isArray(res)) return { products: res };
    return { products: MOCK_JUNIOR_MASTER_PRODUCTS };
  } catch (error) {
    return { products: MOCK_JUNIOR_MASTER_PRODUCTS };
  }
}

export const getProductsBySubCategory = (id, p = 1, l = 10) =>
  getProducts({ subCategoryId: id }, p, l);

export const getProductsBySubCategoryName = (name, p = 1, l = 10) =>
  getProducts({ subCategoryName: name }, p, l);

export const getProductsByCategoryName = (name, p = 1, l = 10) =>
  getProducts({ categoryName: name }, p, l);

export const getProductsByMainCategoryName = (name, p = 1, l = 10) =>
  getProducts({ mainCategoryName: name }, p, l);

export const getProductsByCategory = (id, p = 1, l = 10) =>
  getProducts({ categoryId: id }, p, l);

export const getProductsByMainCategory = (id, p = 1, l = 10) =>
  getProducts({ mainCategoryId: id }, p, l);

export async function getProductBySlug(slug) {
  try {
    const res = await apiClient(`/api/product/${slug}`, {
      tags: ["products", `product-${slug}`],
      revalidate: 15,
    });
    const found = res?.data || res?.product || res;
    if (found && found.id) return found;
  } catch (error) {}

  // Fallback to static mock products
  const mock = MOCK_JUNIOR_MASTER_PRODUCTS.find(
    (p) => p.slug === slug || String(p.id) === String(slug)
  );
  if (mock) return mock;

  return MOCK_JUNIOR_MASTER_PRODUCTS[0];
}

export async function getRelatedProducts(subCategoryId, currentProductId, limit = 8) {
  return MOCK_JUNIOR_MASTER_PRODUCTS.filter(p => p.id !== currentProductId).slice(0, limit);
}
