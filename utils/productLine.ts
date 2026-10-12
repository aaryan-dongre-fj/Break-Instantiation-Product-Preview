import {
  getProducts,
  getVersions,
  STAFF_API_BASE,
  type FlowToolProduct,
  type FlowToolVersionRef,
  type StaffSession,
} from "@/utils/flowTool";

/**
 * uuid5(URL, "break-backend:product") and uuid5(URL, "break-backend:live-version").
 * The Break / BPM card. Descendants are not this id; they point at a real
 * version via `questionnaire_spawned_from_version`.
 */
export const BREAK_ROOT_PRODUCT_ID = "14e5b167-e6df-5afb-bfac-8c461f207a77";
export const BREAK_LIVE_VERSION_ID = "f6bac0b2-3842-5272-9880-be4950ffcaf1";

const BREAK_BPM_CODES = new Set(["break", "bpm"]);

export type ProductLine = "break" | "bvi";

export type LineageNode = {
  id: string;
  name: string;
};

export type ProductLineage = {
  line: ProductLine;
  top: LineageNode | null;
  chain: LineageNode[];
};

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function isBreakName(name: string): boolean {
  const value = normalized(name);
  return (
    value === "break" ||
    value === "bpm" ||
    value === "predictive mind" ||
    value === "brain pattern mapping"
  );
}

function isBreakRoot(product: FlowToolProduct): boolean {
  return (
    product.id === BREAK_ROOT_PRODUCT_ID ||
    product.active_version_id === BREAK_LIVE_VERSION_ID ||
    BREAK_BPM_CODES.has(product.code.trim().toLowerCase())
  );
}

/**
 * Walk `questionnaire_spawned_from_version` from this questionnaire up to
 * the product that has no parent.
 */
export function parentChain(
  questionnaireId: string,
  fallbackName: string,
  versions: FlowToolVersionRef[]
): LineageNode[] {
  const chain: LineageNode[] = [];
  const seen = new Set<string>();
  let currentId = questionnaireId;
  let currentName = fallbackName;

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const rows = versions.filter((version) => version.questionnaire === currentId);
    const name = rows[0]?.questionnaire_name || currentName;
    chain.push({ id: currentId, name });
    const spawned =
      rows
        .map((version) => version.questionnaire_spawned_from_version)
        .find((parent) => parent) ?? null;
    if (!spawned) break;
    const parent = versions.find((version) => version.id === spawned);
    if (!parent) break;
    currentId = parent.questionnaire;
    currentName = parent.questionnaire_name;
  }

  return chain;
}

function lineFromChain(chain: LineageNode[], product?: FlowToolProduct): ProductLine {
  const top = chain[chain.length - 1];
  if (!top) return product && isBreakRoot(product) ? "break" : "bvi";
  if (top.id === BREAK_ROOT_PRODUCT_ID || isBreakName(top.name)) return "break";
  if (chain.length === 1 && product && isBreakRoot(product)) return "break";
  return "bvi";
}

export function lineageForProduct(
  product: FlowToolProduct,
  versions: FlowToolVersionRef[]
): ProductLineage {
  if (
    product.id === BREAK_ROOT_PRODUCT_ID ||
    product.active_version_id === BREAK_LIVE_VERSION_ID
  ) {
    const node = { id: product.id, name: product.name };
    return { line: "break", top: node, chain: [node] };
  }
  const chain = parentChain(product.id, product.name, versions);
  return {
    line: lineFromChain(chain, product),
    top: chain[chain.length - 1] ?? null,
    chain,
  };
}

export function lineageForVersion(
  versionId: string,
  products: FlowToolProduct[],
  versions: FlowToolVersionRef[]
): ProductLineage {
  if (versionId === BREAK_LIVE_VERSION_ID) {
    const node = { id: BREAK_ROOT_PRODUCT_ID, name: "BREAK" };
    return { line: "break", top: node, chain: [node] };
  }
  const product = products.find(
    (entry) => entry.active_version_id === versionId
  );
  if (product) return lineageForProduct(product, versions);
  const version = versions.find((entry) => entry.id === versionId);
  if (!version) return { line: "bvi", top: null, chain: [] };
  const chain = parentChain(
    version.questionnaire,
    version.questionnaire_name,
    versions
  );
  return {
    line: lineFromChain(chain),
    top: chain[chain.length - 1] ?? null,
    chain,
  };
}

/**
 * Scoring always starts on BVI. BVI attaches the Break ML preview token and
 * forwards to break's admin/ml-preview endpoints.
 */
export function scoreEntryUrl(versionId: string): string {
  return `${STAFF_API_BASE}/api/staff/flow-tool/versions/${encodeURIComponent(versionId)}/preview/result/generate-report/`;
}

export async function resolveProductLine(
  staff: StaffSession,
  versionId: string
): Promise<
  | { ok: true; line: ProductLine }
  | { ok: false; status: number; error: string }
> {
  const [products, versions] = await Promise.all([
    getProducts(staff),
    getVersions(staff),
  ]);
  if (!products.ok) return products;
  if (!versions.ok) return versions;
  return {
    ok: true,
    line: lineageForVersion(versionId, products.data, versions.data).line,
  };
}
