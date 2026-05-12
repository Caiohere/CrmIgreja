import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchAPI, extractError } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [eventos, setEventos] = useState([]);
  const [viewCreate, setViewCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      loadEvents();
    }
  }, [isAuthenticated, navigate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/eventos');
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      } else {
        showToast('Erro ao obter eventos.', 'error');
      }
    } catch (err) {
      showToast('Erro de rede ao buscar eventos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      nome: e.target.nome.value,
      descricao: e.target.desc.value,
      dataInicio: new Date(e.target.inicio.value).toISOString(),
      dataFim: new Date(e.target.termino.value).toISOString()
    };

    try {
      const res = await fetchAPI('/evento', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Evento criado com sucesso!');
        e.target.reset();
        setViewCreate(false);
        loadEvents();
      } else {
        const errResponse = await extractError(res);
        showToast('Falha: ' + errResponse, 'error');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const gerarCodigo = async (eventId) => {
    try {
      const res = await fetchAPI(`/eventos/${eventId}/createEventToken`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setQrToken(data.token);
      } else {
        const errTxt = await extractError(res);
        showToast(errTxt, 'error');
      }
    } catch (err) {
      showToast('Erro de rede ao gerar código', 'error');
    }
  };

  const deleteEvento = async (eventId) => {
    if (!window.confirm('Certeza que deseja remover este evento?')) return;
    try {
      const res = await fetchAPI(`/evento/${eventId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        showToast('Evento excluído com sucesso.');
        loadEvents();
      } else {
        const errTxt = await extractError(res);
        showToast(errTxt, 'error');
      }
    } catch (err) {
      showToast('Falha ao tentar excluir evento', 'error');
    }
  };

  const downloadQrCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "QR_Code_Checkin.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      showToast('Download iniciado!', 'success');
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="app-container">
      <header>
        <h1>Eventos</h1>
        <button onClick={logout} className="header-btn">Sair</button>
      </header>

      <main>
        {!viewCreate ? (
          <div id="view-list">
            <div className="flex-between mb-2">
              <h2 style={{ fontSize: '1.2rem' }}>Próximos Eventos</h2>
              <button onClick={() => navigate('/checkin')} className="btn btn-outline btn-sm">Check-in</button>
            </div>
            
            <div id="events-container">
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '2rem' }}>Carregando eventos...</p>
              ) : eventos.length === 0 ? (
                <p className="text-center" style={{ color: 'var(--text-light)', marginTop: '2rem' }}>Nenhum evento encontrado.</p>
              ) : (
                eventos.map(ev => (
                  <div key={ev.id} className="card">
                    <h3 className="card-title">{ev.nome}</h3>
                    <p className="card-subtitle">
                      {new Date(ev.dataInicio).toLocaleString('pt-BR')} - {ev.descricao || ''}
                    </p>
                    <div className="flex-gap mt-2">
                      <button className="btn btn-outline btn-sm" onClick={() => gerarCodigo(ev.id)}>Gerar Código</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteEvento(ev.id)}>Apagar</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setViewCreate(true)} className="fab" title="Criar Evento">+</button>
          </div>
        ) : (
          <div id="view-create" className="card">
            <h2 className="card-title mb-2">Criar Novo Evento</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Nome do Evento</label>
                <input type="text" name="nome" required placeholder="Ex: Culto de Domingo" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input type="text" name="desc" required placeholder="Detalhes..." />
              </div>
              <div className="form-group">
                <label>Início (Data e Hora)</label>
                <input type="datetime-local" name="inicio" required />
              </div>
              <div className="form-group">
                <label>Término (Data e Hora)</label>
                <input type="datetime-local" name="termino" required />
              </div>
              <div className="flex-gap mt-3">
                <button type="button" className="btn btn-outline" onClick={() => setViewCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {qrToken && (
        <div className="modal">
          <div className="modal-content card">
            <h3 className="mb-2" style={{ textAlign: 'center' }}>QR Code do Evento</h3>
            <div className="qr-box mb-2">
              <QRCodeSVG id="qr-code-svg" value={qrToken} size={250} level="H" />
            </div>
            <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center' }}>
              Este é o QR Code de presença. Mostre na recepção ou baixe para impressão.
            </p>
            <div className="flex-gap">
              <button onClick={() => setQrToken(null)} className="btn btn-outline" style={{ flex: 1 }}>Fechar</button>
              <button onClick={downloadQrCode} className="btn btn-primary" style={{ flex: 1 }}>📥 Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
