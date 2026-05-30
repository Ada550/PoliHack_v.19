async function request(path, init = {}) {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  health: () => request('/api/health'),
  products: (query = {}) => {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v != null && v !== '')
    ).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  recommend: (profile) =>
    request('/api/recommend', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
  tryOn: ({ humanImg, garmImg, category, garmentDes }) =>
    request('/api/tryon', {
      method: 'POST',
      body: JSON.stringify({ humanImg, garmImg, category, garmentDes }),
    }),
};
