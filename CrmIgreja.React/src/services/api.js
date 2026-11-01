// "Backend" local que roda no próprio navegador.
// Replica as rotas da API ASP.NET original (CrmIgreja.api/Program.cs),
// guardando os dados no localStorage e já com eventos fictícios para demonstração.
// Não há login: o usuário é sempre tratado como administrador.

export const API_BASE_URL = 'local';

const STORAGE_KEY = 'crm-igreja-db-v1';

// ---------- Dados fictícios ----------
function proximoDiaSemana(diaSemana, hora, minuto, semanasAFrente = 0) {
  const d = new Date();
  d.setHours(hora, minuto, 0, 0);
  let diff = (diaSemana - d.getDay() + 7) % 7;
  if (diff === 0 && d < new Date()) diff = 7;
  d.setDate(d.getDate() + diff + semanasAFrente * 7);
  return d;
}

function evento(id, nome, descricao, inicio, duracaoHoras) {
  const fim = new Date(inicio.getTime() + duracaoHoras * 3600 * 1000);
  return { id, nome, descricao, dataInicio: inicio.toISOString(), dataFim: fim.toISOString() };
}

function seedDb() {
  const eventos = [
    evento(1, 'Culto de Domingo', 'Culto de celebração com Santa Ceia', proximoDiaSemana(0, 19, 0), 2),
    evento(2, 'Culto de Oração', 'Reunião de oração e intercessão', proximoDiaSemana(3, 20, 0), 1.5),
    evento(3, 'Encontro de Jovens', 'Louvor, palavra e comunhão para a juventude', proximoDiaSemana(6, 19, 30), 3),
    evento(4, 'Escola Bíblica Dominical', 'Estudo do livro de Atos - Classe de adultos', proximoDiaSemana(0, 9, 0, 1), 1.5),
    evento(5, 'Culto da Família', 'Culto especial com apresentação das crianças', proximoDiaSemana(0, 19, 0, 1), 2),
    evento(6, 'Ensaio do Coral', 'Preparação para o culto de Natal', proximoDiaSemana(5, 20, 0, 1), 2),
    evento(7, 'Ação Social', 'Distribuição de cestas básicas no bairro', proximoDiaSemana(6, 8, 30, 2), 4),
  ];
  return { eventos, tokens: [], checkins: [] };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignora */ }
  const db = seedDb();
  saveDb(db);
  return db;
}

function saveDb(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch { /* ignora */ }
}

function gerarToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

// ---------- Helpers de resposta ----------
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const erro = (mensagem, status = 400) => json({ detail: mensagem }, status);
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

// ---------- Rotas ----------
function rotear(method, path, body) {
  const db = loadDb();
  let m;

  if (method === 'GET' && path === 'eventos') {
    const lista = [...db.eventos].sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));
    return json(lista);
  }

  if (method === 'POST' && path === 'evento') {
    const inicio = new Date(body.dataInicio);
    const fim = new Date(body.dataFim);
    if (inicio < new Date()) return erro('Não é possível criar um agendamento em data passada.');
    if (fim < inicio) return erro('Data final não pode ser menor que data inicial');
    const id = Math.max(0, ...db.eventos.map(e => e.id)) + 1;
    const novo = { id, nome: body.nome, descricao: body.descricao, dataInicio: body.dataInicio, dataFim: body.dataFim };
    db.eventos.push(novo);
    saveDb(db);
    return json(novo, 201);
  }

  if (method === 'DELETE' && (m = path.match(/^evento\/(\d+)$/))) {
    const id = Number(m[1]);
    const antes = db.eventos.length;
    db.eventos = db.eventos.filter(e => e.id !== id);
    if (db.eventos.length === antes) return json({ Erro: 'Registro não encontrado' }, 404);
    db.tokens = db.tokens.filter(t => t.eventoId !== id);
    saveDb(db);
    return new Response(null, { status: 204 });
  }

  if (method === 'POST' && (m = path.match(/^eventos\/(\d+)\/createEventToken$/))) {
    const eventoId = Number(m[1]);
    if (!db.eventos.some(e => e.id === eventoId)) {
      return json({ Erro: 'Evento não encontrado para gerar o token' }, 404);
    }
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    let token = db.tokens.find(t => t.eventoId === eventoId);
    if (token && !token.isRevogado && new Date(token.expiraEm) > new Date()) {
      token.expiraEm = expiraEm;
      saveDb(db);
      return json({ mensagem: 'Token renovado com sucesso', token: token.token });
    }
    if (!token) {
      token = { eventoId };
      db.tokens.push(token);
    }
    token.token = gerarToken();
    token.expiraEm = expiraEm;
    token.isRevogado = false;
    saveDb(db);
    return json({ mensagem: 'Token criado com sucesso', token: token.token });
  }

  if (method === 'POST' && path === 'checkins') {
    const token = db.tokens.find(t => t.token === (body.eventToken || '').trim());
    if (!token) return json({ Erro: 'Evento não encontrado' }, 404);
    if (token.isRevogado || new Date(token.expiraEm) < new Date()) {
      token.isRevogado = true;
      saveDb(db);
      return erro('Período para presença no evento expirado');
    }
    const checkin = {
      id: db.checkins.length + 1,
      eventId: token.eventoId,
      userId: 1,
      dataHora: new Date().toISOString(),
    };
    db.checkins.push(checkin);
    saveDb(db);
    return json(checkin);
  }

  return json({ Erro: 'Rota não encontrada' }, 404);
}

export const TokenService = {
  setTokens() {},
  getAccessToken() { return 'demo'; },
  getRefreshToken() { return 'demo'; },
  clearTokens() {},
};

export async function fetchAPI(endpoint, options = {}) {
  await delay();
  const method = (options.method || 'GET').toUpperCase();
  const [rawPath] = endpoint.split('?');
  const path = rawPath.replace(/^\/+|\/+$/g, '');
  let body = {};
  try { body = options.body ? JSON.parse(options.body) : {}; } catch { /* ignora */ }
  return rotear(method, path, body);
}

export async function extractError(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.detail || json.title || json.message || json.Erro || "Erro desconhecido ao comunicar com a API.";
  } catch {
    return text || "Ocorreu uma falha na requisição.";
  }
}
