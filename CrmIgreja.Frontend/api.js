const API_BASE_URL = '';

// Utils para Tokens
const TokenService = {
  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Autenticação Fetcher Helper (injetando token e logica de recusa)
async function fetchAPI(endpoint, options = {}) {
  const token = TokenService.getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Tentativa de Refresh Token
    const refreshToken = TokenService.getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refreshToken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ RefreshToken: refreshToken })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          TokenService.setTokens(data.accessToken, data.refreshToken);
          
          // Re-tenta a request original com o novo token
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        }
      } catch (err) {
        console.error("Refresh falhou", err);
      }
    }
    TokenService.clearTokens();
    window.location.href = '/CrmIgreja.Frontend/index.html'; // Vai pro login
    throw new Error('Acesso Não Autorizado');
  }

  return response;
}
