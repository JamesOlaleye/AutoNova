import type { Metadata } from 'next';
import { Car } from 'lucide-react';
import { LoginForm } from './_components/login-form';

export const metadata: Metadata = { title: 'Sign In — AutoNova' };

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Only allow relative internal paths — strip anything that looks external
  const from = params.from?.startsWith('/') ? params.from : '/dashboard';

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md">
            <Car className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AutoNova</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight text-white">
            The platform that powers modern car dealerships.
          </h2>
          <p className="text-base text-white/50 leading-relaxed max-w-md">
            Manage your inventory, track leads, close deals — all in one beautifully
            designed dashboard built for the way you sell.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <p className="text-xs text-white/30">AutoNova © {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-8">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight">AutoNova</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your dealer dashboard to continue.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-7 shadow-sm">
            <LoginForm redirectTo={from} />
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Need access? Contact your dealership administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
