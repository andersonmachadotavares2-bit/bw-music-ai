'use client';

export default function AudioPlayer({ music }) {
  return (
    <audio controls src={music.url} preload="lazy">
      Seu navegador não suporta o player de áudio.
    </audio>
  );
}
