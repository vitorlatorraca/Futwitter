const normalizeBaseUrl = (url: string | undefined) => {
  if (!url) return "";
  // Remove trailing slash
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

const isAbsoluteUrl = (path: string) => /^https?:\/\//i.test(path);

export function resolveApiUrl(path: string) {
  if (!path) {
    throw new Error("resolveApiUrl requires a path");
  }

  // If path is already an absolute URL, return it as-is
  if (isAbsoluteUrl(path)) {
    return path;
  }

  // Normalize path to start with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If API_BASE is not set, use relative URL (works when frontend and backend are on same origin)
  if (!API_BASE) {
    // In development, if we're on the same origin, relative URLs work fine
    // In production, you should set VITE_API_BASE_URL
    return normalizedPath;
  }

  // If API_BASE is set, combine it with the path
  // Ensure no double slashes
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const pathPart = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  return `${base}${pathPart}`;
}

export function getApiBaseUrl() {
  return API_BASE;
}

