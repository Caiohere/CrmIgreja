// auth.js
if (TokenService.getAccessToken()) {
  window.location.href = 'dashboard.html';
}

function toggleAuthMode() {
  document.getElementById('login-section').classList.toggle('d-none');
  document.getElementById('register-section').classList.toggle('d-none');
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;
  const btn = e.target.querySelector('button');
  btn.innerText = 'Enviando...';
  
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    if (res.ok) {
      const data = await res.json();
      TokenService.setTokens(data.accessToken, data.refreshToken);
      window.location.href = 'dashboard.html';
    } else {
      const msgerro = await extractError(res);
      AppToast.show(msgerro || 'Credenciais inválidas.', 'error');
    }
  } catch(err) {
    AppToast.show('Erro ao conectar ao servidor.', 'error');
  } finally {
    btn.innerText = 'Acessar';
  }
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('reg-nome').value;
  const email = document.getElementById('reg-email').value;
  const senha = document.getElementById('reg-senha').value;
  const btn = e.target.querySelector('button');
  btn.innerText = 'Cadastrando...';
  
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    if (res.ok) {
        AppToast.show('Conta criada com sucesso! Faça login.', 'success');
        toggleAuthMode();
    } else {
      const msgerro = await extractError(res);
      AppToast.show(msgerro, 'error');
    }
  } catch(err) {
    AppToast.show('Erro de conexão.', 'error');
  } finally {
    btn.innerText = 'Cadastrar';
  }
});
