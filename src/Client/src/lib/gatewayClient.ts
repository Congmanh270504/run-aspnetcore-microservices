const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:6004";

export async function fetchFromGateway<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  const url = `${GATEWAY_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchDirect<T>(
  baseUrl: string | undefined,
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  if (!baseUrl) return null;
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return null;
  } catch {
    return null;
  }
}

