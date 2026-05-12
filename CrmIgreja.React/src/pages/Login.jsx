import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL, extractError } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleMode = () => setIsLogin(!isLogin);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const senha = e.target.senha.value;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      if (res.ok) {
        const data = await res.json();
        login(data.accessToken, data.refreshToken);
        navigate('/dashboard');
      } else {
        const msgerro = await extractError(res);
        showToast(msgerro || 'Credenciais inválidas.', 'error');
      }
    } catch(err) {
      showToast('Erro ao conectar ao servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const nome = e.target.nome.value;
    const email = e.target.email.value;
    const senha = e.target.senha.value;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      if (res.ok) {
          showToast('Conta criada com sucesso! Faça login.', 'success');
          toggleMode();
      } else {
        const msgerro = await extractError(res);
        showToast(msgerro, 'error');
      }
    } catch(err) {
      showToast('Erro de conexão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: 700 }}>CrmIgreja</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Gestão de Eventos simples e ágil.</p>
      </div>

      {isLogin ? (
        <div className="card">
          <h2 className="card-title text-center">Entrar</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" required placeholder="********" />
            </div>
            <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
              {loading ? 'Enviando...' : 'Acessar'}
            </button>
          </form>
          <div className="text-center mt-3">
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Não tem conta? </span>
            <button onClick={toggleMode} className="switch-link" style={{ background: 'none', border: 'none' }}>Registre-se</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title text-center">Criar Conta</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input type="text" name="nome" required placeholder="Seu nome" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" required placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label>Senha (Mínimo 8 dígitos, 1 n.º, 1 caract. especial)</label>
              <input type="password" name="senha" required placeholder="Senhaorte#123" />
            </div>
            <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          <div className="text-center mt-3">
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Já possui conta? </span>
            <button onClick={toggleMode} className="switch-link" style={{ background: 'none', border: 'none' }}>Faça Login</button>
          </div>
        </div>
      )}
    </div>
  );
}
