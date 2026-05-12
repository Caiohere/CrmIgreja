import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchAPI, extractError } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';

export default function Checkin() {
  const [isScanning, setIsScanning] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isAuthenticated, navigate]);

  const startScanner = () => {
    const html5QrcodeScanner = new Html5Qrcode("reader");
    scannerRef.current = html5QrcodeScanner;
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
      .then(() => {
        setIsScanning(true);
        showToast('Câmera ativada!', 'success');
      })
      .catch(err => {
        showToast('Por favor, permita o uso da câmera.', 'error');
        console.error("Camera falhou:", err);
      });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
        scannerRef.current = null;
      }).catch(err => console.error(err));
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    stopScanner();
    showToast('QR Code detectado. Processando check-in...', 'success');
    efetuarCheckin(decodedText);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    efetuarCheckin(e.target.token.value);
  };

  const efetuarCheckin = async (eventToken) => {
    try {
      const res = await fetchAPI('/checkins', {
        method: 'POST',
        body: JSON.stringify({ eventToken })
      });
      
      if (res.ok) {
        setSuccessModal(true);
      } else {
        const errTxt = await extractError(res);
        showToast('Falha no Check-in: ' + errTxt, 'error');
      }
    } catch(err) {
      showToast('Erro ao processar check-in.', 'error');
    }
  };

  return (
    <div className="app-container">
      <header>
        <button onClick={() => navigate('/dashboard')} className="header-btn">&larr; Voltar</button>
        <h1>Check-in</h1>
        <div></div>
      </header>

      <main>
        <div className="card mb-2">
          <h2 className="card-title text-center mb-1">Escanear QR Code</h2>
          <p className="card-subtitle text-center mb-2">Aponte a câmera para o evento</p>
          
          <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
          
          <div className="text-center mt-2">
            {!isScanning ? (
              <button onClick={startScanner} className="btn btn-primary">Ativar Câmera</button>
            ) : (
              <button onClick={stopScanner} className="btn btn-outline mt-1">Parar Câmera</button>
            )}
          </div>
        </div>

        <div className="card mt-2">
          <h3 className="card-title text-center mb-1">Código Manual</h3>
          <p className="card-subtitle text-center mb-2">Se preferir, digite o Token</p>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <input type="text" name="token" required placeholder="Token gerado pelo Admin" />
            </div>
            <button type="submit" className="btn btn-outline">Confirmar Presença</button>
          </form>
        </div>
      </main>

      {successModal && (
        <div className="modal">
          <div className="modal-content card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 className="mb-2" style={{ color: 'var(--success-color)', fontSize: '1.5rem' }}>Check-in Confirmado!</h2>
            <p className="mb-3" style={{ color: 'var(--text-light)', lineHeight: '1.4' }}>
              Sua presença foi confirmada com sucesso.<br />Aproveite o evento!
            </p>
            <button 
              onClick={() => {
                setSuccessModal(false);
                navigate('/dashboard');
              }} 
              className="btn btn-primary" 
              style={{ width: '100%' }}
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
