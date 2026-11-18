const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

let loginPromise: Promise<string | null> | null = null;

async function ensureAuthenticated(): Promise<{ token: string | null; tenantId: string | null }> {
  if (typeof window === 'undefined') {
    return { token: null, tenantId: null };
  }

  let token = localStorage.getItem('token');
  let tenantId = localStorage.getItem('tenantId');

  if (token && tenantId) {
    return { token, tenantId };
  }

  // Se não houver token, executa auto-login com o usuário administrador padrão do seed
  if (!loginPromise) {
    loginPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@despachante.com.br',
            senha: 'Admin@123456',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('tenantId', data.empresa.id);
          localStorage.setItem('user', JSON.stringify(data.usuario));
          localStorage.setItem('empresa', JSON.stringify(data.empresa));
          return data.token;
        }
      } catch (err) {
        console.warn('[API Client] Auto-login não pôde ser completado:', err);
      } finally {
        loginPromise = null;
      }
      return null;
    })();
  }

  const authenticatedToken = await loginPromise;
  return {
    token: authenticatedToken || localStorage.getItem('token'),
    tenantId: localStorage.getItem('tenantId'),
  };
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const { token, tenantId } = await ensureAuthenticated();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.erro?.message || `Erro ${response.status} na requisição`);
  }

  return response.json();
}
