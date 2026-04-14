// dashboard.js
if (!TokenService.getAccessToken()) {
  window.location.href = 'index.html';
}

function toggleView() {
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
      AppToast.show('Evento criado com sucesso!');
      e.target.reset();
      toggleView();
      loadEvents();
    } else {
      const errResponse = await extractError(res);
      AppToast.show('Falha: ' + errResponse, 'error');
    }
  } catch (err) {
    AppToast.show('Falha na comunicação com o servidor.', 'error');
  } finally {
    btn.innerText = 'Salvar';
  }
});

async function gerarCodigo(eventId) {
  try {
    const res = await fetchAPI(`/eventos/${eventId}/createEventToken`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showQrModal(data.token);
    } else {
      const errTxt = await extractError(res);
      AppToast.show(errTxt, 'error');
    }
  } catch (err) {
    AppToast.show('Erro de rede ao gerar código', 'error');
  }
}

let qrCodeInstance = null;

function showQrModal(tokenStr) {
  const box = document.getElementById('qrcode-box');
  box.innerHTML = ''; // Limpa anterior
  
  qrCodeInstance = new QRCode(box, {
      text: tokenStr,
      width: 250,
      height: 250,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
  });

  document.getElementById('qr-modal').classList.remove('d-none');
}

function closeQrModal() {
  document.getElementById('qr-modal').classList.add('d-none');
}

function downloadQrCode() {
  const box = document.getElementById('qrcode-box');
  const img = box.querySelector('img');
  const canvas = box.querySelector('canvas');
  let dataUrl = '';
  
  if (img && img.src && img.src.startsWith('data:image')) {
      dataUrl = img.src;
  } else if (canvas) {
      dataUrl = canvas.toDataURL("image/png");
  }

  if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'QR_Code_Checkin.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      AppToast.show('Download iniciado!', 'success');
  } else {
      AppToast.show('Aguarde o QR Code carregar antes de baixar.', 'error');
  }
}

async function deleteEvento(eventId) {
  if (!confirm('Certeza que deseja remover este evento?')) return;
  try {
    const res = await fetchAPI(`/evento/${eventId}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      AppToast.show('Evento excluído com sucesso.');
      loadEvents();
    } else {
      const errTxt = await extractError(res);
      AppToast.show(errTxt, 'error');
    }
  } catch (err) {
    AppToast.show('Falha ao tentar excluir evento', 'error');
  }
}

// init
loadEvents();
