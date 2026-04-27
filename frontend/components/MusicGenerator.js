'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchMusics, generateMusic } from '../lib/api';
import { supabase } from '../lib/supabase';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://bw-music-ai-production.up.railway.app';

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

  const isSignup = useMemo(() => authMode === 'signup', [authMode]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setMusics([]);
      return;
    }

    syncProfile(session);
    loadMusics();
  }, [session]);

  async function syncProfile(currentSession) {
    try {
      await fetch(`${API_URL}/auth/sync-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });
    } catch (err) {
      console.warn('Não foi possível sincronizar o perfil:', err);
    }
  }

  async function loadMusics() {
    try {
      setError('');
      const data = await fetchMusics();
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

    try {
      setLoading(true);
      const newMusic = await generateMusic(prompt);
      setMusics((previous) => [newMusic, ...previous]);
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

      const endpoint = isSignup ? '/auth/signup' : '/auth/login';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          fullName,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAuthMessage(payload.message || 'Erro de autenticação.');
        return;
      }

     if (payload.session?.access_token) {
  setSession(payload.session);
  setAuthMessage('Login realizado com sucesso.');
  setAuthPassword('');
  return;
  }

      setAuthMessage(
        isSignup
          ? 'Conta criada! Verifique seu email para confirmar o cadastro.'
          : 'Login realizado com sucesso.'
      );

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session) {
        setSession(sessionData.session);
      }

      setAuthPassword('');
    } catch (err) {
      setAuthMessage(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRecoverPassword() {
    setAuthMessage('');
    setError('');

    if (!authEmail) {
      setAuthMessage('Informe seu email para recuperar a senha.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAuthMessage(payload.message || 'Erro ao solicitar recuperação.');
        return;
      }

      setAuthMessage(payload.message || 'Email de recuperação enviado.');
    } catch (err) {
      setAuthMessage(err.message || 'Falha ao solicitar recuperação.');
    }
  }

  async function handleLogout() {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (currentSession?.access_token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            console.log('TOKEN:', currentSession.access_token);
          },
        });
      }
    } catch (err) {
      console.warn('Erro ao encerrar sessão no backend:', err);
    } finally {
      await supabase.auth.signOut();
      setSession(null);
      setMusics([]);
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
            {isSignup && (
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
              {authLoading ? 'Processando...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              disabled={authMode === 'login'}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              disabled={authMode === 'signup'}
            >
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
        <p className="subtitle">Logado como {session.user?.email}</p>

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
                  <small>{new Date(music.created_at).toLocaleString('pt-BR')}</small>
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
