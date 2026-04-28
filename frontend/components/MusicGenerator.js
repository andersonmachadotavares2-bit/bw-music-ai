'use client';

import { useEffect, useState } from 'react';
import { fetchMusics, generateMusic } from '../lib/api';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bw-music-ai-production.up.railway.app';

  // Tenta recuperar a sessão do localStorage ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem('bw_music_token');
    const savedUser = localStorage.getItem('bw_music_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Carrega músicas quando o token estiver disponível
  useEffect(() => {
    if (token) {
      loadMusics(token);
    } else {
      setMusics([]);
    }
  }, [token]);

  async function loadMusics(accessToken) {
    try {
      setError('');
      const data = await fetchMusics(accessToken);
      setMusics(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar músicas.');
      if (err.message.includes('autenticado')) {
        handleLogout();
      }
    }
  }

  async function handleGenerateMusic(event) {
    event.preventDefault();
    setError('');

    if (!prompt.trim()) {
      setError('Digite um prompt para gerar uma música.');
      return;
    }

    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    try {
      setLoading(true);
      const newMusic = await generateMusic(prompt, token);
      setMusics((prev) => [newMusic, ...prev]);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Erro ao gerar música.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthMessage('');
    setError('');

    if (!authEmail || !authPassword) {
      setAuthMessage('Preencha email e senha.');
      return;
    }

    try {
      setAuthLoading(true);
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          fullName: fullName
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Erro na autenticação.');

      if (authMode === 'signup' && !result.session) {
        setAuthMessage('Cadastro realizado! Verifique seu e-mail para confirmar.');
      } else if (result.session?.access_token) {
        const accessToken = result.session.access_token;
        const userData = result.user;
        
        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('bw_music_token', accessToken);
        localStorage.setItem('bw_music_user', JSON.stringify(userData));
        setAuthMessage('Sucesso!');
      }
    } catch (err) {
      setAuthMessage(err.message || 'Erro na autenticação.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bw_music_token');
    localStorage.removeItem('bw_music_user');
    setMusics([]);
  }

  if (!token) {
    return (
      <main className="container">
        <section className="card">
          <h1>BW Music AI</h1>
          <p className="subtitle">{authMode === 'signup' ? 'Crie sua conta' : 'Entre na sua conta'}</p>

          <form className="generator-form" onSubmit={handleAuth}>
            {authMode === 'signup' && (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            )}
            <input
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Senha"
              type="password"
              required
            />
            <button type="submit" disabled={authLoading}>
              {authLoading ? 'Processando...' : authMode === 'signup' ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              {authMode === 'login' ? 'Quero me cadastrar' : 'Já tenho conta'}
            </button>
          </div>
          {authMessage && <p className="subtitle">{authMessage}</p>}
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>BW Music AI</h1>
          <button onClick={handleLogout} style={{ background: '#f43f5e', padding: '5px 15px', borderRadius: '5px', color: 'white', border: 'none', cursor: 'pointer' }}>Sair</button>
        </div>
        <p className="subtitle">Olá, {user?.email}</p>

        <form className="generator-form" onSubmit={handleGenerateMusic}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Jazz suave para estudar"
            rows={3}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar Música'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card" style={{ marginTop: '2rem' }}>
        <h2>Minhas Músicas</h2>
        {musics.length === 0 ? (
          <p className="empty">Nenhuma música gerada ainda.</p>
        ) : (
          <ul className="music-list">
            {musics.map((music) => (
              <li key={music.id} className="music-item">
                <div style={{ marginBottom: '10px' }}>
                  <p className="prompt">{music.prompt}</p>
                  <small>{new Date(music.created_at).toLocaleString('pt-BR')}</small>
                </div>
                <audio controls src={music.url} style={{ width: '100%' }}>
                  Seu navegador não suporta áudio.
                </audio>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
