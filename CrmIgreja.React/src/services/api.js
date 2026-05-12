export const API_BASE_URL = 'http://localhost:5242'; // Replace with actual API base url if different

export const TokenService = {
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

export async function fetchAPI(endpoint, options = {}) {
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
          
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        }
      } catch (err) {
        console.error("Refresh falhou", err);
      }
    }
    TokenService.clearTokens();
    window.location.href = '/'; 
    throw new Error('Acesso Não Autorizado');
  }

  return response;
}

export async function extractError(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.detail || json.title || json.message || json.Erro || "Erro desconhecido ao comunicar com a API.";
  } catch(e) {
    return text || "Ocorreu uma falha na requisição.";
  }
}
