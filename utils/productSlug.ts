import type { FlowToolProduct } from "@/utils/flowTool";

const VERSION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVersionId(value: string): boolean {
  return VERSION_ID_RE.test(value);
}

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "product";
}

function nameSlug(product: FlowToolProduct): string {
  return slugify(product.name);
}

function withCode(product: FlowToolProduct): string {
  const base = nameSlug(product);
  const code = slugify(product.code);
  if (code && code !== "product") return `${base}-${code}`;
  return `${base}-${slugify(product.id)}`;
}

/** Canonical public path segment for one product given the full list. */
export function slugForProduct(
  product: FlowToolProduct,
  products: FlowToolProduct[]
): string {
  const base = nameSlug(product);
  const nameClashes = products.filter((entry) => nameSlug(entry) === base);
  if (nameClashes.length === 1) return base;

  const coded = withCode(product);
  const codeClashes = nameClashes.filter((entry) => withCode(entry) === coded);
  if (codeClashes.length === 1) return coded;

  return `${coded}-${slugify(product.id)}`;
}

export function findProductBySlug(
  products: FlowToolProduct[],
  slug: string
): FlowToolProduct | undefined {
  return products.find(
    (product) => slugForProduct(product, products) === slug
  );
}

export function findProductByVersionId(
  products: FlowToolProduct[],
  versionId: string
): FlowToolProduct | undefined {
  return products.find((product) => product.active_version_id === versionId);
}

export function resolvePreviewProduct(
  products: FlowToolProduct[],
  param: string
): {
  product: FlowToolProduct;
  canonicalSlug: string;
  fromVersionId: boolean;
} | null {
  if (isVersionId(param)) {
    const byVersion = findProductByVersionId(products, param);
    if (byVersion) {
      return {
        product: byVersion,
        canonicalSlug: slugForProduct(byVersion, products),
        fromVersionId: true,
      };
    }
  }

  const bySlug = findProductBySlug(products, param);
  if (!bySlug) return null;

  return {
    product: bySlug,
    canonicalSlug: slugForProduct(bySlug, products),
    fromVersionId: false,
  };
}
