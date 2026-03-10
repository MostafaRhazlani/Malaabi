"use client";

import { useState } from "react";
import Image from "next/image";
import { RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine, RiImageLine } from "@remixicon/react";
import type { AdminStadium } from "@/interfaces/stadiums.interface";
import type { StadiumStatus } from "@/types/admin.types";

const STATUS_COLORS: Record<StadiumStatus, string> = {
  PENDING: "text-orange-400 bg-orange-500/10",
  ACTIVE: "text-green-400 bg-green-500/10",
  SUSPENDED: "text-red-400 bg-red-500/10",
};

interface Props {
  stadium: AdminStadium;
  onClose: () => void;
}

export default function StadiumDetailsModal({ stadium, onClose }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasImages = stadium.images.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">{stadium.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Image carousel */}
        <div className="relative bg-slate-950 h-64 flex items-center justify-center">
          {hasImages ? (
            <>
              <Image
                src={stadium.images[imgIndex]}
                alt={`${stadium.name} photo ${imgIndex + 1}`}
                fill
                className="object-cover"
              />
              {stadium.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i - 1 + stadium.images.length) % stadium.images.length)}
                    className="absolute left-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <RiArrowLeftSLine className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i + 1) % stadium.images.length)}
                    className="absolute right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <RiArrowRightSLine className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 flex gap-1">
                    {stadium.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/30"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <RiImageLine className="w-10 h-10" />
              <span className="text-sm">No photos uploaded</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">City</p>
              <p className="text-slate-200 text-sm">{stadium.city}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[stadium.status]}`}>
                {stadium.status}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Address</p>
              <p className="text-slate-200 text-sm">{stadium.address}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Manager</p>
              <p className="text-slate-200 text-sm">
                {stadium.manager.first_name} {stadium.manager.last_name}
              </p>
              <p className="text-xs text-slate-500">{stadium.manager.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Added</p>
              <p className="text-slate-200 text-sm">
                {new Date(stadium.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
