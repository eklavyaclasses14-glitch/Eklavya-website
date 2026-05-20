// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// export const apiFetch = async (url, options = {}) => {
//   const token = localStorage.getItem('token');
  
//   // Resolve relative URLs automatically
//   const finalUrl = url.startsWith('http') ? url : `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

// const headers = {
//   ...(options.headers || {}),
// };

// if (!(options.body instanceof FormData)) {
//   headers['Content-Type'] = 'application/json';
// }

// if (token) {
//   headers['Authorization'] = Bearer ${token};
// }

//   const response = await fetch(finalUrl, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     if (response.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//       throw new Error('Unauthorized');
//     }
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.error || `Error ${response.status}`);
//   }

//   return response;
// };
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  // Resolve relative URLs automatically
  const finalUrl = url.startsWith('http')
    ? url
    : `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Only set JSON header for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.error || `Error ${response.status}`);
  }

  return response;
};
