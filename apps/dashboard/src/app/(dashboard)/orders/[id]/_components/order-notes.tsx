'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StickyNote, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUiStore } from '@/store/ui.store';
import { updateOrderNotesAction } from '@/app/(dashboard)/actions';

export function OrderNotes({ orderId, initialNotes }: { orderId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  const isDirty = notes !== (initialNotes ?? '');

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrderNotesAction(orderId, notes);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Notes saved', 'success');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Deal Notes</p>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add deal terms, negotiation history, customer requirements…"
        rows={4}
        className="resize-none text-sm"
        aria-label="Deal notes"
      />
      <Button
        size="sm"
        onClick={handleSave}
        disabled={!isDirty || isPending}
        loading={isPending}
        className="gap-2"
      >
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
        {isPending ? 'Saving…' : 'Save Notes'}
      </Button>
    </div>
  );
}
