// utils/apiFetch.js
// Drop-in fetch wrapper used across all admin pages.
// Automatically reads the JWT from localStorage and attaches it as a Bearer token.
// Throws a plain Error with err.message set to the server's error text on non-2xx responses.

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.token ?? null;
  } catch {
    return null;
  }
};

/**
 * apiFetch(url, options?)
 *
 * Works exactly like fetch() but:
 *  - Always sets Content-Type: application/json (unless you override it)
 *  - Attaches Authorization: Bearer <token> when a token exists in localStorage
 *  - Throws an Error with the server's message text on non-2xx responses
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  const token = getToken();

const headers = {
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(options.headers ?? {}),
};

if (!(options.body instanceof FormData)) {
  headers['Content-Type'] = 'application/json';
}

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch {
      // body wasn't JSON — keep the default message
    }
    throw new Error(message);
  }

  return response;
}
