/**
 * Wrapper around fetch that redirects to /login on 401 responses.
 * Use this in client components instead of raw fetch() for API calls.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Session expired or invalid — redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized — redirecting to login');
  }

  return response;
}
