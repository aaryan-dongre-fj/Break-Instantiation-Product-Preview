/**
 * Cookie names for this app's own origin. Kept free of `next/headers` so the
 * edge middleware can import them.
 *
 * These are not the API's cookie names — a `__Secure-` prefixed cookie can't
 * be set over plain http on localhost, and the session value never leaves the
 * server anyway.
 */
export const SESSION_COOKIE = "portal_session";
export const CSRF_COOKIE = "portal_csrf";
export const USER_COOKIE = "portal_user";

/** Django Token + session key for the scoring host (CLIENT_API_BASE). */
export const CLIENT_TOKEN_COOKIE = "portal_client_token";
export const CLIENT_SESSION_COOKIE = "portal_client_session_key";
