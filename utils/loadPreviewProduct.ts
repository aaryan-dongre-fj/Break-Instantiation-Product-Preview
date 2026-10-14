import { notFound, redirect } from "next/navigation";
import { getProducts, type FlowToolProduct } from "@/utils/flowTool";
import { resolvePreviewProduct } from "@/utils/productSlug";
import { getStaffEmail, getStaffSession } from "@/utils/staffSession";
import { requestCompanyPath } from "@/utils/look";

export type PreviewLoad =
  | {
      ok: true;
      product: FlowToolProduct;
      slug: string;
      versionId: string;
      email: string | null;
    }
  | { ok: false; error: string; email: string | null };

/**
 * Resolve `/preview/[slug]` (or a legacy version-id URL) to the live product.
 * Legacy UUID paths redirect to the canonical slug. `pathAfterParam` is
 * appended as-is (`/results?answered=1`) so query strings survive the hop.
 */
export async function loadPreviewProduct(
  param: string,
  pathAfterParam = ""
): Promise<PreviewLoad> {
  const staff = await getStaffSession();
  if (!staff) redirect(await requestCompanyPath("/login"));

  const email = await getStaffEmail();
  const products = await getProducts(staff);

  if (!products.ok && products.status === 401) redirect(await requestCompanyPath("/login"));
  if (!products.ok) return { ok: false, error: products.error, email };

  const resolved = resolvePreviewProduct(products.data, param);
  if (!resolved) notFound();

  if (resolved.fromVersionId || resolved.canonicalSlug !== param) {
    redirect(await requestCompanyPath(`/preview/${resolved.canonicalSlug}${pathAfterParam}`));
  }

  if (!resolved.product.active_version_id) {
    return {
      ok: false,
      error: "This product has never been published — nothing to preview yet.",
      email,
    };
  }

  return {
    ok: true,
    product: resolved.product,
    slug: resolved.canonicalSlug,
    versionId: resolved.product.active_version_id,
    email,
  };
}
