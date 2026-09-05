import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CABAL Allocation Checker',
  description: 'Checker alokasi CABAL token berbasis RPC Base',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
