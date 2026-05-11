'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ImagePlus, AlertCircle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/ui.store';
import { uploadVehicleImageAction, deleteVehicleImageAction } from '@/app/(dashboard)/actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface VehicleImageUploadProps {
  vehicleId: string;
  images: string[];
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function extractPublicId(url: string): string {
  // Cloudinary URL format: .../upload/v{version}/{public_id}.{ext}
  // For placeholders, just use the URL as the identifier
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return url;
    return parts[1].replace(/\.[^.]+$/, ''); // strip extension
  } catch {
    return url;
  }
}

export function VehicleImageUpload({ vehicleId, images }: VehicleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const addToast = useUiStore((s) => s.addToast);

  function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const file = files[0];

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP images are accepted.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    startTransition(async () => {
      try {
        const base64 = await convertToBase64(file);
        const result = await uploadVehicleImageAction(vehicleId, base64);
        if (result.error) {
          setUploadError(result.error);
        } else {
          addToast('Image uploaded successfully', 'success');
          router.refresh();
        }
      } catch {
        setUploadError('Upload failed. Please try again.');
      }
    });
  }

  function handleDelete(url: string) {
    setDeletingUrl(url);
    startTransition(async () => {
      const publicId = extractPublicId(url);
      const result = await deleteVehicleImageAction(vehicleId, publicId, url);
      setDeletingUrl(null);
      if (result.error) {
        addToast(result.error, 'error');
      } else {
        addToast('Image removed', 'success');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url) => (
            <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <Image
                src={url}
                alt="Vehicle photo"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Delete overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(url)}
                  disabled={deletingUrl === url || isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-60"
                  aria-label="Remove image"
                >
                  {deletingUrl === url ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <X className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Car className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No photos yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Add photos to make your listing stand out</p>
        </div>
      )}

      {/* Upload area */}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30',
          isPending && 'pointer-events-none opacity-60',
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Upload vehicle image"
        />

        <div className="flex flex-col items-center gap-2">
          {isPending ? (
            <>
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop an image here or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB}MB per image
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {uploadError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{uploadError}</p>
        </div>
      )}

      {images.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Add another photo
        </Button>
      )}
    </div>
  );
}
