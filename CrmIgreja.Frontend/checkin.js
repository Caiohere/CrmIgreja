// checkin.js
if (!TokenService.getAccessToken()) {
  window.location.href = 'index.html';
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('feedbackMsg');
  el.textContent = msg;
  el.className = `alert ${isError ? 'alert-error' : 'alert-success'}`;
  el.classList.remove('d-none');
}

// Scanner variables
let html5QrcodeScanner = null;
let isScanning = false;

document.getElementById('btn-scan').addEventListener('click', () => {
  if (isScanning) return;
  startScanner();
});

document.getElementById('btn-stop').addEventListener('click', () => {
  if (!isScanning) return;
  stopScanner();
});

function startScanner() {
    html5QrcodeScanner = new Html5Qrcode("reader");
    
    // Configurações do Scanner, ideal para dispositivos móveis
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
    .then(() => {
        isScanning = true;
        document.getElementById('btn-scan').classList.add('d-none');
        document.getElementById('btn-stop').classList.remove('d-none');
        showMessage('Câmera ativada!', false);
    })
    .catch(err => {
        showMessage('Por favor, permita o uso da câmera.', true);
        console.error("Camera falhou:", err);
    });
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            isScanning = false;
            document.getElementById('btn-scan').classList.remove('d-none');
            document.getElementById('btn-stop').classList.add('d-none');
        }).catch(err => console.error(err));
    }
}

// Callback quando o QR Code é lido com Sucesso
function onScanSuccess(decodedText, decodedResult) {
  stopScanner();
  showMessage('QR Code detectado. Processando check-in...', false);
  efetuarCheckin(decodedText);
}

// Form Manual
document.getElementById('form-checkin').addEventListener('submit', (e) => {
  e.preventDefault();
  const token = document.getElementById('manual-token').value;
  efetuarCheckin(token);
});

async function efetuarCheckin(eventToken) {
    try {
        const res = await fetchAPI('/checkins', {
            method: 'POST',
            body: JSON.stringify({ eventToken })
        });
        
        if (res.ok) {
            showMessage('Presença confirmada com sucesso! Você pode fechar esta tela e curtir o evento.', false);
        } else {
            const data = await res.text();
            showMessage('Falha no Check-in: O token é inválido, ou você já fez check-in.', true);
        }
    } catch(err) {
        showMessage('Erro ao processar check-in.', true);
    }
}
