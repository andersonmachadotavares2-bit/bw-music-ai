'use client';

import { useEffect, useState } from 'react';
import { fetchMusics, generateMusic } from '../lib/api';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMusics();
  }, []);

  async function loadMusics() {
    try {
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

  return (
    <main className="container">
      <section className="card">
        <h1>BW Music AI</h1>
        <p className="subtitle">Crie trilhas em segundos com prompts de texto.</p>

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
        <h2>Músicas geradas</h2>
        {musics.length === 0 ? (
          <p className="empty">Nenhuma música gerada ainda.</p>
        ) : (
          <ul className="music-list">
            {musics.map((music) => (
              <li key={music.id} className="music-item">
                <div>
                  <p className="prompt">{music.prompt}</p>
                  <small>
                    {new Date(music.createdAt).toLocaleString('pt-BR')}
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
