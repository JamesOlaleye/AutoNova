import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getDealerConfig } from '@/lib/dealer-config';
import { CompareBar } from '@/components/common/compare-bar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const dealer = await getDealerConfig();
  return {
    title: {
      default: `${dealer.name} — Find Your Next Vehicle`,
      template: `%s | ${dealer.name}`,
    },
    description: `Browse premium vehicles at ${dealer.name}. ${dealer.tagline ?? 'Find your perfect vehicle'}.${dealer.city ? ` Based in ${dealer.city}.` : ''}`,
    keywords: ['cars', 'vehicles', 'car dealership', 'buy car', 'used cars', 'new cars', dealer.name, dealer.city].filter(Boolean) as string[],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dealer = await getDealerConfig();

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar dealer={dealer} />
        <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-4rem)]">
          {children}
        </main>
        <Footer dealer={dealer} />
        <CompareBar />
      </body>
    </html>
  );
}
