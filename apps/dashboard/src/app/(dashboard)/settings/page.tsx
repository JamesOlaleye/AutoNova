import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ChevronRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Settings' };

const SETTINGS_ITEMS = [
  {
    href: '/settings/password',
    icon: Lock,
    title: 'Change Password',
    description: 'Update your account password',
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="divide-y rounded-xl border bg-card shadow-sm">
        {SETTINGS_ITEMS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-[64px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
