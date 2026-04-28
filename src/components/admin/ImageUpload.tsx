"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUpload({ value, onChange, max = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (value.length + files.length > max) {
      setError(`Máximo ${max} imágenes`);
      return;
    }

    setUploading(true);
    setError("");

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError("Cada imagen debe pesar menos de 10MB");
        continue;
      }

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
      else setError(data.error || "Error al subir imagen");
    }

    onChange([...value, ...uploaded]);
    setUploading(false);
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function moveLeft(idx: number) {
    if (idx === 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-frigia-dark">
        Imágenes{" "}
        <span className="text-neutral-400 font-normal">
          ({value.length}/{max})
        </span>
      </p>

      <div className="flex flex-wrap gap-3">
        {value.map((url, idx) => (
          <div key={url} className="relative group w-24 h-24">
            <Image
              src={url}
              alt={`Imagen ${idx + 1}`}
              fill
              className="object-cover rounded-lg border border-neutral-200"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveLeft(idx)}
                  className="text-white text-xs bg-black/50 rounded px-1 py-0.5"
                  title="Mover a la izquierda"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="text-white text-xs bg-red-500/80 rounded px-1 py-0.5"
              >
                ×
              </button>
            </div>
            {idx === 0 && (
              <span className="absolute -top-1 -left-1 bg-frigia-gold text-white text-[10px] rounded px-1">
                principal
              </span>
            )}
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-300 hover:border-frigia-rose hover:bg-frigia-cream/50 transition-colors flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-frigia-rose"
          >
            {uploading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-[10px]">Subir foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-neutral-400">
        JPG, PNG, WEBP · Máx 10MB por imagen · La primera imagen es la principal
      </p>
    </div>
  );
}
