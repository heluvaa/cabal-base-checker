import type { Metadata } from 'next';

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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
