'use client';

import { useEffect, useState } from 'react';
import { fetchMusics, generateMusic } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Sincroniza sessão do Supabase com o estado local
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega músicas quando a sessão estiver disponível
  useEffect(() => {
    if (session?.access_token) {
      loadMusics(session.access_token);
    } else {
      setMusics([]);
    }
  }, [session]);

  async function loadMusics(accessToken) {
    try {
      setError('');
      const data = await fetchMusics(accessToken);
      setMusics(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar músicas.');
    }
  }

  async function handleGenerateMusic(event) {
    event.preventDefault();
    setError('');

    if (!prompt.trim()) {
      setError('Digite um prompt para gerar uma música.');
      return;
    }

    if (!session?.access_token) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    try {
      setLoading(true);
      // O backend agora retorna o objeto salvo diretamente (fluxo síncrono MVP)
      const newMusic = await generateMusic(prompt, session.access_token);
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
      let result;

      if (authMode === 'signup') {
        result = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: fullName } }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
      }

      if (result.error) throw result.error;

      if (authMode === 'signup' && !result.data.session) {
        setAuthMessage('Cadastro realizado! Verifique seu e-mail.');
      } else {
        setAuthMessage('Sucesso!');
      }
    } catch (err) {
      setAuthMessage(err.message || 'Erro na autenticação.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setMusics([]);
  }

  if (!session) {
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
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>BW Music AI</h1>
          <button onClick={handleLogout} style={{ background: '#f43f5e' }}>Sair</button>
        </div>
        <p className="subtitle">Olá, {session.user.email}</p>

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
