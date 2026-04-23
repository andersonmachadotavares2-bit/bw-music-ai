import './globals.css';

export const metadata = {
  title: 'BW Music AI',
  description: 'Gerador de músicas com IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
