import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoNova — Find Your Next Vehicle',
  description: 'Browse premium vehicles from certified dealers worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
