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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      syncProfile(session);
      loadMusics();
    } else {
      setMusics([]);
    }
  }, [session]);


  async function syncProfile(currentSession) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/sync-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentSession.access_token}`,
      },
    });
  }

  async function loadMusics() {
    try {
      setError('');
      const data = await fetchMusics();
      setMusics(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerateMusic(event) {
    event.preventDefault();
    setError('');

    if (!prompt.trim()) {
      setError('Digite um prompt para gerar uma música.');
      return;
    }

    try {
      setLoading(true);
      const newMusic = await generateMusic(prompt);
      setMusics((previous) => [newMusic, ...previous]);
      setPrompt('');
    } catch (err) {
      setError(err.message);
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

    setAuthLoading(true);

    let result;

    if (authMode === 'signup') {
      result = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      });

    } else {
      result = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
    }

    setAuthLoading(false);

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }

    setAuthMessage(
      authMode === 'signup'
        ? 'Conta criada! Verifique seu email para confirmar o cadastro, se exigido no Supabase.'
        : 'Login realizado com sucesso.'
    );
    setAuthPassword('');
  }

  async function handleRecoverPassword() {
    setAuthMessage('');

    if (!authEmail) {
      setAuthMessage('Informe seu email para recuperar a senha.');
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/recover-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setAuthMessage(payload.message || 'Erro ao solicitar recuperação.');
      return;
    }

    setAuthMessage(payload.message);
  }

  async function handleLogout() {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession?.access_token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        });
      }
    } finally {
      await supabase.auth.signOut();
      setAuthMessage('Logout realizado.');
    }
  }

  if (!session) {
    return (
      <main className="container">
        <section className="card">
          <h1>BW Music AI</h1>
          <p className="subtitle">Faça login para gerar músicas personalizadas.</p>

          <form className="generator-form" onSubmit={handleAuth}>
            {authMode === 'signup' && (
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nome completo"
              />
            )}
            <input
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email"
              type="email"
            />
            <input
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Senha"
              type="password"
            />

            <button type="submit" disabled={authLoading}>
              {authLoading
                ? 'Processando...'
                : authMode === 'signup'
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => setAuthMode('login')} disabled={authMode === 'login'}>
              Login
            </button>
            <button type="button" onClick={() => setAuthMode('signup')} disabled={authMode === 'signup'}>
              Cadastro
            </button>
            <button type="button" onClick={handleRecoverPassword}>
              Recuperar senha
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
        <h1>BW Music AI</h1>
        <p className="subtitle">Crie trilhas em segundos com prompts de texto.</p>
        <p className="subtitle">Logado como {session.user.email}</p>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>

        <form className="generator-form" onSubmit={handleGenerateMusic}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ex.: Música eletrônica energética para treino"
            rows={4}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar Música'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>Minhas músicas geradas</h2>
        {musics.length === 0 ? (
          <p className="empty">Nenhuma música gerada ainda.</p>
        ) : (
          <ul className="music-list">
            {musics.map((music) => (
              <li key={music.id} className="music-item">
                <div>
                  <p className="prompt">{music.prompt}</p>
                  <small>
                    {new Date(music.created_at).toLocaleString('pt-BR')}
                  </small>
                </div>
                <audio controls src={music.url} preload="none">
                  Seu navegador não suporta o player de áudio.
                </audio>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
