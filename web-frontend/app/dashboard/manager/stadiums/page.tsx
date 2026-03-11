"use client";

import { useState } from "react";
import { RiBuilding2Line, RiAddLine } from "@remixicon/react";
import { useManagerStadiums } from "@/hooks/useManagerStadiums";
import type { ManagerStadium } from "@/interfaces/manager.interface";
import StadiumCard from "./_components/StadiumCard";
import CreateStadiumModal from "./_components/CreateStadiumModal";
import EditPricesModal from "./_components/EditPricesModal";
import PhotosModal from "./_components/PhotosModal";
import DeleteStadiumModal from "./_components/DeleteStadiumModal";

export default function ManagerStadiumsPage() {
  const stadiumsHook = useManagerStadiums();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ManagerStadium | null>(null);
  const [photosTarget, setPhotosTarget] = useState<ManagerStadium | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerStadium | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Stadiums</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your stadiums, pricing and photos</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          New Stadium
        </button>
      </div>

      {stadiumsHook.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {stadiumsHook.error}
        </div>
      )}

      {stadiumsHook.loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : stadiumsHook.stadiums.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-slate-500">
          <RiBuilding2Line className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No stadiums yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stadiumsHook.stadiums.map((stadium) => (
            <StadiumCard
              key={stadium.id}
              stadium={stadium}
              onEditPrices={setEditTarget}
              onPhotos={setPhotosTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateStadiumModal
          onCreate={stadiumsHook.createStadium}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <EditPricesModal
          stadium={editTarget}
          onSave={stadiumsHook.editPrices}
          onClose={() => setEditTarget(null)}
        />
      )}
      {photosTarget && (
        <PhotosModal
          stadium={photosTarget}
          onUpload={stadiumsHook.uploadPhotos}
          onDeletePhoto={stadiumsHook.deletePhoto}
          onClose={() => setPhotosTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteStadiumModal
          stadium={deleteTarget}
          onDelete={stadiumsHook.deleteStadium}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
