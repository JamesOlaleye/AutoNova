'use client';

import { useRef, useState, useTransition } from 'react';
import { FileText, Upload, Trash2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { uploadOrderDocumentAction, deleteOrderDocumentAction } from '@/app/(dashboard)/actions';
import { formatDate } from '@/lib/utils';
import type { OrderDocument, OrderDocType } from '@/types';

const DOC_TYPE_LABELS: Record<OrderDocType, string> = {
  CONTRACT: 'Contract',
  TITLE:    'Title',
  ID:       'ID / Passport',
  INSURANCE:'Insurance',
  OTHER:    'Other',
};

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS) as [OrderDocType, string][];

const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp';
const MAX_SIZE_MB = 10;

interface Props {
  orderId: string;
  initialDocuments: OrderDocument[];
}

export function OrderDocuments({ orderId, initialDocuments }: Props) {
  const [docs, setDocs] = useState<OrderDocument[]>(initialDocuments);
  const [docType, setDocType] = useState<OrderDocType>('CONTRACT');
  const [uploading, startUpload] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addToast = useUiStore((s) => s.addToast);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast(`File must be under ${MAX_SIZE_MB}MB`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      startUpload(async () => {
        const result = await uploadOrderDocumentAction(orderId, base64, file.name, docType);
        if (result.error) {
          addToast(result.error, 'error');
        } else {
          const newDoc: OrderDocument = {
            url: '',
            publicId: `uploading_${Date.now()}`,
            name: file.name,
            docType,
            uploadedAt: new Date().toISOString(),
          };
          setDocs((prev) => [...prev, newDoc]);
          addToast('Document uploaded', 'success');
          // Refresh to get the real URL from the server
          window.location.reload();
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleDelete(publicId: string) {
    setDeletingId(publicId);
    const result = await deleteOrderDocumentAction(orderId, publicId);
    setDeletingId(null);
    if (result.error) {
      addToast(result.error, 'error');
    } else {
      setDocs((prev) => prev.filter((d) => d.publicId !== publicId));
      addToast('Document removed', 'success');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Documents</h2>
        <span className="ml-auto text-xs text-muted-foreground">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Upload row */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as OrderDocType)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Document type"
        >
          {DOC_TYPES.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-label="Choose document to upload"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          {uploading ? 'Uploading…' : 'Upload Document'}
        </Button>
        <p className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG · max {MAX_SIZE_MB}MB</p>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No documents attached yet</p>
        </div>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Attached documents">
          {docs.map((doc) => (
            <li
              key={doc.publicId}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {DOC_TYPE_LABELS[doc.docType]} · {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${doc.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${doc.name}`}
                  disabled={deletingId === doc.publicId}
                  onClick={() => handleDelete(doc.publicId)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  {deletingId === doc.publicId ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
