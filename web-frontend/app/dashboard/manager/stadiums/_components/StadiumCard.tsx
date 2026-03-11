"use client";

import {
  RiBuilding2Line,
  RiEditLine,
  RiImageAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiTimeLine,
  RiProhibitedLine,
} from "@remixicon/react";
import type { ManagerStadium, StadiumStatus } from "@/interfaces/manager.interface";

const STATUS_STYLES: Record<StadiumStatus, string> = {
  ACTIVE: "text-green-400 bg-green-500/10",
  PENDING: "text-yellow-400 bg-yellow-500/10",
  SUSPENDED: "text-red-400 bg-red-500/10",
};

const STATUS_ICONS: Record<StadiumStatus, React.ElementType> = {
  ACTIVE: RiCheckLine,
  PENDING: RiTimeLine,
  SUSPENDED: RiProhibitedLine,
};

interface Props {
  stadium: ManagerStadium;
  onEditPrices: (stadium: ManagerStadium) => void;
  onPhotos: (stadium: ManagerStadium) => void;
  onDelete: (stadium: ManagerStadium) => void;
}

export default function StadiumCard({ stadium, onEditPrices, onPhotos, onDelete }: Props) {
  const StatusIcon = STATUS_ICONS[stadium.status];
  const cover = stadium.images?.[0];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
      {cover ? (
        <div className="relative h-32 w-full overflow-hidden">
          <img src={cover} alt={stadium.name} className="w-full h-full object-cover" />
          {stadium.images.length > 1 && (
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              +{stadium.images.length - 1} more
            </span>
          )}
        </div>
      ) : (
        <div className="h-32 w-full bg-white/5 flex items-center justify-center border-b border-white/10">
          <RiBuilding2Line className="w-8 h-8 text-slate-600" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-white">{stadium.name}</p>
            <p className="text-xs text-slate-400">{stadium.city} · {stadium.address}</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[stadium.status]}`}>
            <StatusIcon className="w-3 h-3" />
            {stadium.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-slate-500">Full Match</p>
            <p className="text-white font-semibold">${stadium.priceFullMatch}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-slate-500">Half Match</p>
            <p className="text-white font-semibold">${stadium.priceHalfMatch}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-auto pt-1 border-t border-white/5">
          <button
            onClick={() => onEditPrices(stadium)}
            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <RiEditLine className="w-3.5 h-3.5" />
            Edit Prices
          </button>
          <button
            onClick={() => onPhotos(stadium)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors ml-auto"
          >
            <RiImageAddLine className="w-3.5 h-3.5" />
            Photos
            {(stadium.images?.length ?? 0) > 0 && (
              <span className="ml-0.5 text-slate-500">({stadium.images.length})</span>
            )}
          </button>
          <button
            onClick={() => onDelete(stadium)}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <RiDeleteBinLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
