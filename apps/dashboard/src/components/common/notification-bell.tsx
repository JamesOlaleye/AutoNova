'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { Lead } from '@/types';

const LEAD_TYPE_LABEL: Record<string, string> = {
  INQUIRY: 'Enquiry',
  TEST_DRIVE: 'Test Drive',
  TRADE_IN: 'Trade-In',
  FINANCING: 'Financing',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const { data, total } = await res.json();
      setLeads(data ?? []);
      setCount(total ?? 0);
    } catch {
      // fail silently
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Notifications${count > 0 ? ` — ${count} new` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white"
            aria-hidden="true"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border bg-card shadow-xl"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold text-foreground">New Enquiries</p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {leads.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No new enquiries</p>
              </div>
            ) : (
              <ul>
                {leads.map((lead) => (
                  <li key={lead.id} className="border-b last:border-0">
                    <Link
                      href={`/leads/${lead.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{LEAD_TYPE_LABEL[lead.type] ?? lead.type}</p>
                        </div>
                        <p className="shrink-0 text-[10px] text-muted-foreground">{formatDate(lead.createdAt)}</p>
                      </div>
                      {lead.message && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{lead.message}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t px-4 py-2">
            <Link
              href="/leads"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-primary hover:underline"
            >
              View all enquiries →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
