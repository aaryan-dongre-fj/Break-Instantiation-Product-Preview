import raw from "../instance.config.json";

export type InstanceConfig = {
  productName: string;
  packageName: string;
  title: string;
  description: string;
  logo: string;
  favicon: string;
  devPort: number;
  appUrl: string;
  apiBaseUrl: string;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const productName = text(raw.productName, "Company X");
const devPort = Number(raw.devPort) || 3001;

export const instance: InstanceConfig = {
  productName,
  packageName: text(raw.packageName, "product-preview"),
  title: text(raw.title, productName),
  description: text(
    raw.description,
    `Sign in to ${productName} with the link sent to your email.`,
  ),
  logo: text(raw.logo),
  favicon: text(raw.favicon, "/favicon.svg"),
  devPort,
  appUrl: text(raw.appUrl, `http://localhost:${devPort}`).replace(/\/$/, ""),
  apiBaseUrl: text(raw.apiBaseUrl, "http://127.0.0.1:8000").replace(/\/$/, ""),
};

function trimUrl(value: string) {
  return value.replace(/\/+$/, "");
}

/** Generic API. `API_BASE_URL` wins, then the older `STAFF_API_BASE` name. */
export function apiBaseUrl() {
  return trimUrl(
    process.env.API_BASE_URL || process.env.STAFF_API_BASE || instance.apiBaseUrl,
  );
}

/** This app. Sent as the Origin on API calls. */
export function appUrl() {
  return trimUrl(process.env.APP_URL || instance.appUrl);
}

/** Scoring host. Falls back to the generic API when it is the same service. */
export function clientApiBase() {
  return trimUrl(process.env.CLIENT_API_BASE || apiBaseUrl());
}

/**
 * Company localhost sites keep `APP_URL`'s port on their own hostname.
 * Every other host uses `APP_URL` as written.
 */
export function portalOriginFor(host: string | null) {
  const app = appUrl();
  const hostname = (host ?? "").split(":")[0];
  if (!hostname.endsWith(".localhost")) return app;
  const url = new URL(app);
  url.hostname = hostname;
  return url.origin;
}
