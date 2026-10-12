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
