// const API_URL = 'http://localhost:3001';

// export async function apiFetch(endpoint: string, options?: RequestInit) {
//   const res = await fetch(`${API_URL}${endpoint}`, {
//     ...options,
//     cache: 'no-store', // დინამიური მონაცემებისთვის
//   });
//   if (!res.ok) throw new Error('API Error');
//   return res.json();
// }


const API_URL = 'http://localhost:3001';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json', // <--- დაამატე ეს
      ...options?.headers,
    },
    cache: 'no-store',
  });
  
  if (!res.ok) {
    // მოდი, დავლოგოთ რეალური ერორი ბრაუზერში
    const errorData = await res.json().catch(() => ({}));
    console.error('API Error Details:', errorData);
    throw new Error(`API Error: ${res.status}`);
  }
  
  return res.json();
}