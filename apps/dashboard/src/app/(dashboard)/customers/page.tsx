import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Mail, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { getSession } from '@/lib/session';
import { getLeads } from '@/lib/api/leads';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Lead } from '@/types';

export const metadata: Metadata = { title: 'Customer Profiles' };

interface CustomerProfile {
  name: string;
  email: string;
  phone: string | null;
  enquiryCount: number;
  lastContact: string;
  latestLeadId: string;
}

function buildCustomerProfiles(leads: Lead[]): CustomerProfile[] {
  const map = new Map<string, CustomerProfile>();
  for (const lead of leads) {
    const existing = map.get(lead.email);
    if (!existing) {
      map.set(lead.email, {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || null,
        enquiryCount: 1,
        lastContact: lead.createdAt,
        latestLeadId: lead.id,
      });
    } else {
      existing.enquiryCount += 1;
      if (new Date(lead.createdAt) > new Date(existing.lastContact)) {
        existing.lastContact = lead.createdAt;
        existing.latestLeadId = lead.id;
        if (lead.phone && !existing.phone) existing.phone = lead.phone;
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime(),
  );
}

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: leads } = await getLeads(session.token, session.tenantId, { limit: 500 });
  const customers = buildCustomerProfiles(leads);

  return (
    <div>
      <PageHeader
        title="Customer Profiles"
        description={`${customers.length} unique customer${customers.length !== 1 ? 's' : ''} derived from enquiry history`}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customer profiles are built from submitted enquiries. Once customers make enquiries, they will appear here."
        />
      ) : (
        <div className="mt-6 divide-y rounded-xl border bg-card shadow-sm">
          {customers.map((c) => (
            <Link
              key={c.email}
              href={`/leads?search=${encodeURIComponent(c.email)}`}
              className="flex min-h-[72px] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {c.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {c.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <Badge variant="secondary" className="text-xs">
                  <MessageCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                  {c.enquiryCount} {c.enquiryCount === 1 ? 'enquiry' : 'enquiries'}
                </Badge>
                <p className="text-xs text-muted-foreground">{formatDate(c.lastContact)}</p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
