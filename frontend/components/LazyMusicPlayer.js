'use client';

import { lazy, Suspense } from 'react';

// Componente de player de áudio com lazy loading
const AudioPlayer = lazy(() => import('./AudioPlayer'));

export default function LazyMusicPlayer({ music }) {
  return (
    <Suspense fallback={<div className="audio-placeholder">Carregando player...</div>}>
      <AudioPlayer music={music} />
    </Suspense>
  );
}
