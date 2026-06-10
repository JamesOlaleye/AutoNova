import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoNova Admin',
  description: 'Platform administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
