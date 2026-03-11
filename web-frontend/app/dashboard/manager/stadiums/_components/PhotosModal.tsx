"use client";

import { useRef, useState } from "react";
import {
  RiAddLine,
  RiBuilding2Line,
  RiCloseLine,
  RiDeleteBinLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { toast } from "sonner";
import type { ManagerStadium } from "@/interfaces/manager.interface";

interface Props {
  stadium: ManagerStadium;
  onUpload: (stadium: ManagerStadium, files: File[]) => Promise<ManagerStadium>;
  onDeletePhoto: (stadium: ManagerStadium, url: string) => Promise<ManagerStadium>;
  onClose: () => void;
}

export default function PhotosModal({ stadium, onUpload, onDeletePhoto, onClose }: Props) {
  const [current, setCurrent] = useState<ManagerStadium>(stadium);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    setUploadFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...images.filter((f) => !names.has(f.name))].slice(0, 10);
    });
  }

  function removeFile(index: number) {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    try {
      const updated = await onUpload(current, uploadFiles);
      setCurrent(updated);
      setUploadFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(url: string) {
    setDeletingUrl(url);
    try {
      const updated = await onDeletePhoto(current, url);
      setCurrent(updated);
    } catch {
      toast.error("Failed to delete photo");
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Stadium Photos</h2>
            <p className="text-slate-400 text-sm">{current.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Existing photos */}
          {current.images.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <RiBuilding2Line className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No photos yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {current.images.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <button
                    onClick={() => handleDeletePhoto(url)}
                    disabled={deletingUrl === url}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {deletingUrl === url ? (
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      <RiDeleteBinLine className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition-colors ${
              dragOver
                ? "border-primary-500 bg-primary-500/10"
                : "border-white/15 bg-white/3 hover:border-primary-500/50 hover:bg-white/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
              className="hidden"
            />
            <RiUploadCloud2Line className={`w-7 h-7 transition-colors ${dragOver ? "text-primary-400" : "text-slate-500"}`} />
            <p className="text-sm text-slate-400 font-medium">
              {dragOver ? "Drop images here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-slate-600">JPEG, PNG, WebP — up to 10 images</p>
          </div>

          {/* Selected file thumbnails */}
          {uploadFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {uploadFiles.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                    <img src={url} onLoad={() => URL.revokeObjectURL(url)} alt={file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {uploadFiles.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-primary-500/50 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <RiAddLine className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || uploadFiles.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RiUploadCloud2Line className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload Photos"}
          </button>
        </div>
      </div>
    </div>
  );
}
