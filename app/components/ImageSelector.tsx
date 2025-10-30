import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface MediaItem {
  id: string;
  url: string;
  name: string;
}

interface ImageSelectorProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageSelector({ onSelect, onClose }: ImageSelectorProps) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "media"));
    const items = snap.docs.map((d) => ({ 
      id: d.id, 
      ...d.data(),
    })) as MediaItem[];
    setImages(items);
    setLoading(false);
  };

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a1027] rounded-lg border-2 border-[#d4af37] max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#d4af37]/30 flex items-center justify-between">
          <h2 className="text-xl text-[#d4af37] font-bold">
            🖼️ Choisir une image depuis la galerie
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-[#d4af37]">
              <p>⏳ Chargement des images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-2xl mb-2">📷</p>
              <p>Aucune image dans la galerie.</p>
              <p className="text-sm mt-2">Va dans "🖼️ Images" pour en uploader !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => handleSelect(img.url)}
                  className="relative group cursor-pointer bg-[#101734]/50 rounded-lg overflow-hidden border-2 border-[#d4af37]/20 hover:border-[#d4af37] transition"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-[#0a1027]/90">
                    <p className="text-xs text-gray-400 truncate">{img.name}</p>
                  </div>
                  <div className="absolute inset-0 bg-[#d4af37]/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-[#d4af37] text-black px-3 py-1 rounded font-semibold">
                      Choisir
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d4af37]/30 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            💡 Clique sur une image pour la sélectionner
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}