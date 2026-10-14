import { cache } from "react";
import { headers } from "next/headers";

import { companyPath } from "@/utils/company";
import { apiBaseUrl, instance } from "@/utils/instance";

export type Look = {
  name: string;
  logo: string;
  favicon: string;
  title: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    primaryHover: string;
  };
};

const fallbackColors = {
  primary: "#c99a6e",
  primaryForeground: "#ffffff",
  primaryHover: "#b18458",
};

export function fallbackLook(): Look {
  return {
    name: instance.productName,
    logo: instance.logo,
    favicon: instance.favicon,
    title: instance.title,
    description: instance.description,
    colors: fallbackColors,
  };
}

/** The company of the request being served. middleware.ts sets the header. */
export async function requestCompany(): Promise<string | null> {
  try {
    return (await headers()).get("x-company");
  } catch {
    return null;
  }
}

/** The API for this request's company: API_BASE_URL/t/<company>. */
export async function requestApiBase(): Promise<string> {
  const company = await requestCompany();
  return company ? `${apiBaseUrl()}/t/${company}` : apiBaseUrl();
}

/** A portal path inside this request's company, for server redirects. */
export async function requestCompanyPath(path: string): Promise<string> {
  return companyPath(await requestCompany(), path);
}

export const loadLook = cache(async (): Promise<Look> => {
  if (!(await requestCompany())) return fallbackLook();
  try {
    const response = await fetch(`${await requestApiBase()}/api/look/`, {
      cache: "no-store",
    });
    if (!response.ok) return fallbackLook();
    return normalizeLook(await response.json());
  } catch {
    return fallbackLook();
  }
});

function normalizeLook(data: unknown): Look {
  const fallback = fallbackLook();
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;
  const colors =
    record.colors && typeof record.colors === "object"
      ? (record.colors as Record<string, unknown>)
      : {};
  return {
    name: text(record.name, fallback.name),
    logo: text(record.logo),
    favicon: text(record.favicon, fallback.favicon),
    title: text(record.title, fallback.title),
    description: text(record.description, fallback.description),
    colors: {
      primary: text(colors.primary, fallback.colors.primary),
      primaryForeground: text(
        colors.primaryForeground,
        fallback.colors.primaryForeground,
      ),
      primaryHover: text(colors.primaryHover, fallback.colors.primaryHover),
    },
  };
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
