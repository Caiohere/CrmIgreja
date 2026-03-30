// dashboard.js
if (!TokenService.getAccessToken()) {
  window.location.href = 'index.html';
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

function toggleView() {
  hideMessage();
  document.getElementById('view-list').classList.toggle('d-none');
  document.getElementById('view-create').classList.toggle('d-none');
}

function logout() {
  TokenService.clearTokens();
  window.location.href = 'index.html';
}

// Fetch events from API
async function loadEvents() {
  const container = document.getElementById('events-container');
  try {
    const res = await fetchAPI('/eventos'); // Assume endpoint
    const eventos = await res.json();

    container.innerHTML = '';
    if (eventos.length === 0) {
      container.innerHTML = '<p class="text-center" style="color:var(--text-light)">Nenhum evento encontrado.</p>';
      return;
    }

    eventos.forEach(ev => {
      const start = new Date(ev.dataInicio).toLocaleString('pt-BR');
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3 class="card-title">${ev.nome}</h3>
        <p class="card-subtitle">${start} - ${ev.descricao || ''}</p>
        <div class="flex-gap mt-2">
            <button class="btn btn-outline btn-sm" onclick="gerarCodigo(${ev.id})">Gerar Código</button>
            <button class="btn btn-danger btn-sm" onclick="deleteEvento(${ev.id})">Apagar</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = '<p class="text-center" style="color:var(--danger-color)">Erro ao obter eventos.</p>';
  }
}

// Create new event
document.getElementById('form-create').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerText = 'Salvando...';

  const payload = {
    nome: document.getElementById('ev-nome').value,
    descricao: document.getElementById('ev-desc').value,
    dataInicio: new Date(document.getElementById('ev-inicio').value).toISOString(),
    dataFim: new Date(document.getElementById('ev-termino').value).toISOString()
  };

  try {
    const res = await fetchAPI('/evento', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showMessage('Evento criado com sucesso!');
      e.target.reset();
      toggleView();
      loadEvents();
    } else {
      alert('Apenas admins podem criar eventos');
    }
  } catch (err) {
    alert('Falha na comunicação.');
  } finally {
    btn.innerText = 'Salvar';
  }
});

async function gerarCodigo(eventId) {
  try {
    const res = await fetchAPI(`/eventos/${eventId}/createEventToken`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert(`Token do Evento (QR Code Manual):\n\n${data.token}\n\nMostre para o check-in!`);
    } else {
      alert('Apenas admins podem gerar código ou: ' + data.Erro);
    }
  } catch (err) {
    alert('Erro ao gerar código');
  }
}

async function deleteEvento(eventId) {
  if (!confirm('Certeza que deseja remover este evento?')) return;
  try {
    const res = await fetchAPI(`/evento/${eventId}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      loadEvents();
    } else {
      alert('Falha (Apenas Admins podem apagar)');
    }
  } catch (err) {
    alert('Erro');
  }
}

// init
loadEvents();
