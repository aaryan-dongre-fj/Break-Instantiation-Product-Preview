// The company is the first path segment: /ej/login is EJ's sign-in page.
// The API serves that company at API_BASE_URL/t/ej/. Same slug rule as the
// API. Portal page names are reserved so /login is never read as a company.
const COMPANY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const RESERVED = new Set([
  "api",
  "_next",
  "login",
  "invite",
  "magic-login",
  "consent",
  "products",
  "preview",
]);

export function companyFromPath(pathname: string): string | null {
  const segment = pathname.split("/")[1] ?? "";
  return COMPANY_PATTERN.test(segment) && !RESERVED.has(segment) ? segment : null;
}

/** `/products` for EJ is `/ej/products`. */
export function companyPath(company: string | null, path: string): string {
  return company ? `/${company}${path}` : path;
}

/** `companyPath` for the page open in the browser. Client code only. */
export function withCompany(path: string): string {
  return companyPath(companyFromPath(window.location.pathname), path);
}
