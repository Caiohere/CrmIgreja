// auth.js
if (TokenService.getAccessToken()) {
  window.location.href = 'dashboard.html';
}

function toggleAuthMode() {
  document.getElementById('login-section').classList.toggle('d-none');
  document.getElementById('register-section').classList.toggle('d-none');
  hideMessage();
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('feedbackMsg');
  el.textContent = msg;
  el.className = `alert ${isError ? 'alert-error' : 'alert-success'}`;
  el.classList.remove('d-none');
}

function hideMessage() {
  document.getElementById('feedbackMsg').classList.add('d-none');
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();
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
      showMessage('Credenciais inválidas.', true);
    }
  } catch(err) {
    showMessage('Erro ao conectar ao servidor.', true);
  } finally {
    btn.innerText = 'Acessar';
  }
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();
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
        showMessage('Conta criada com sucesso! Faça login.', false);
        toggleAuthMode();
    } else {
      const err = await res.json();
      showMessage(err.detail || 'Erro ao registrar.', true);
    }
  } catch(err) {
    showMessage('Erro de conexão.', true);
  } finally {
    btn.innerText = 'Cadastrar';
  }
});
