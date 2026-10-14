"use client";

import { createContext, useCallback, useContext } from "react";
import { companyPath } from "@/utils/company";

const CompanyContext = createContext<string | null>(null);

export function CompanyProvider({
  company,
  children,
}: {
  company: string | null;
  children: React.ReactNode;
}) {
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>;
}

/** Turns `/products` into `/ej/products`. Works during server rendering too. */
export function useCompanyHref() {
  const company = useContext(CompanyContext);
  return useCallback((path: string) => companyPath(company, path), [company]);
}
