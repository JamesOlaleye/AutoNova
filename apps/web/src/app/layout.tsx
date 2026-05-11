import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { dealerConfig } from '@/lib/dealer-config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${dealerConfig.name} — Find Your Next Vehicle`,
    template: `%s | ${dealerConfig.name}`,
  },
  description: `Browse premium vehicles at ${dealerConfig.name}. ${dealerConfig.tagline}.${dealerConfig.city ? ` Based in ${dealerConfig.city}.` : ''}`,
  keywords: ['cars', 'vehicles', 'car dealership', 'buy car', 'used cars', 'new cars', dealerConfig.name, dealerConfig.city].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-4rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
