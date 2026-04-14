// checkin.js
if (!TokenService.getAccessToken()) {
  window.location.href = 'index.html';
}

// Removes showMessage

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
        AppToast.show('Câmera ativada!', 'success');
    })
    .catch(err => {
        AppToast.show('Por favor, permita o uso da câmera.', 'error');
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
  AppToast.show('QR Code detectado. Processando check-in...', 'success');
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
            document.getElementById('checkin-success-modal').classList.remove('d-none');
        } else {
            const errTxt = await extractError(res);
            AppToast.show('Falha no Check-in: ' + errTxt, 'error');
        }
    } catch(err) {
        AppToast.show('Erro ao processar check-in.', 'error');
    }
}
