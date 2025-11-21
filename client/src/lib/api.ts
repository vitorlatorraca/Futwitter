const normalizeBaseUrl = (url: string | undefined) => {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

const isAbsoluteUrl = (path: string) => /^https?:\/\//i.test(path);

export function resolveApiUrl(path: string) {
  if (!path) {
    throw new Error("resolveApiUrl requires a path");
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE) {
    return normalizedPath;
  }

  return `${API_BASE}${normalizedPath}`;
}

export function getApiBaseUrl() {
  return API_BASE;
}

