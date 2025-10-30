import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import ImageSelector from "./ImageSelector";

interface Block {
  id: string;
  type: "h1" | "h2" | "h3" | "p" | "image";
  content: string;
}

interface PageEditorProps {
  pageId: string;
  onSave?: () => void;
}

export default function PageEditor({ pageId, onSave }: PageEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    setLoading(true);
    const ref = doc(db, "pages", pageId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().blocks) {
      setBlocks(snap.data().blocks);
    } else {
      setBlocks([
        { id: Date.now().toString(), type: "h1", content: "Titre de la page" }
      ]);
    }
    setLoading(false);
  };

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setBlocks([...blocks, newBlock]);
    setShowFloatingMenu(false);
    
    setTimeout(() => {
      const element = document.getElementById(`block-${newBlock.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleChange = (id: string, value: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: value } : b)));
  };

  const handleDelete = (id: string) => {
    if (blocks.length === 1) {
      alert("⚠️ Vous devez garder au moins un bloc");
      return;
    }
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // === DRAG & DROP FUNCTIONS ===
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = "move";
    // Ajoute un effet visuel
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBlockId(null);
    setDragOverBlockId(null);
    (e.target as HTMLElement).style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedBlockId && draggedBlockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  };

  const handleDragLeave = () => {
    setDragOverBlockId(null);
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    
    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      return;
    }

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex((b) => b.id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "pages", pageId), { blocks });
      alert("✅ Page sauvegardée sur Firestore !");
      onSave?.();
    } catch (error) {
      alert("❌ Erreur lors de la sauvegarde");
      console.error(error);
    }
    setSaving(false);
  };

  const openImageSelector = (blockId: string) => {
    setCurrentImageBlockId(blockId);
    setShowImageSelector(true);
  };

  const handleImageSelect = (url: string) => {
    if (currentImageBlockId) {
      handleChange(currentImageBlockId, url);
    }
  };

  if (loading) {
    return <div className="text-center text-[#d4af37]">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Info bulle pour le drag & drop */}
      <div className="mb-4 p-3 bg-[#101734]/50 rounded-lg border border-[#d4af37]/20 text-center">
        <p className="text-sm text-gray-400">
          💡 <span className="text-[#d4af37]">Glissez-déposez</span> les blocs pour les réorganiser ou utilisez les boutons ⬆️⬇️
        </p>
      </div>

      {/* Blocs de contenu */}
      <div className="space-y-4 mb-6">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            id={`block-${block.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, block.id)}
            className={`border-2 p-4 rounded-lg transition-all cursor-move ${
              draggedBlockId === block.id
                ? "border-[#d4af37] bg-[#0a1027]/50 scale-105"
                : dragOverBlockId === block.id
                ? "border-[#d4af37] bg-[#0a1027] border-dashed"
                : "border-[#d4af37]/30 bg-[#0a1027] hover:border-[#d4af37]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Icône de drag */}
                <span className="text-gray-500 cursor-grab active:cursor-grabbing" title="Glisser pour déplacer">
                  ⋮⋮
                </span>
                <span className="text-xs text-[#d4af37] font-semibold uppercase">
                  {block.type === "h1" && "📌 Titre principal (H1)"}
                  {block.type === "h2" && "📍 Sous-titre (H2)"}
                  {block.type === "h3" && "📎 Petit titre (H3)"}
                  {block.type === "p" && "📝 Paragraphe"}
                  {block.type === "image" && "🖼️ Image"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moveBlock(block.id, "up")}
                  disabled={index === 0}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Monter"
                >
                  ⬆️
                </button>
                <button
                  onClick={() => moveBlock(block.id, "down")}
                  disabled={index === blocks.length - 1}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Descendre"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>

            {(block.type === "h1" || block.type === "h2" || block.type === "h3") && (
              <input
                type="text"
                className={`w-full bg-[#101734] border-2 border-[#d4af37]/30 rounded px-3 py-2 focus:border-[#d4af37] focus:outline-none transition ${
                  block.type === "h1" ? "text-3xl font-bold" : 
                  block.type === "h2" ? "text-2xl font-semibold" :
                  "text-xl font-medium"
                }`}
                value={block.content}
                onChange={(e) => handleChange(block.id, e.target.value)}
                placeholder={`Entrez votre ${block.type.toUpperCase()}...`}
              />
            )}

            {block.type === "p" && (
              <textarea
                className="w-full bg-[#101734] border-2 border-[#d4af37]/30 rounded px-3 py-2 focus:border-[#d4af37] focus:outline-none transition resize-none"
                rows={4}
                value={block.content}
                onChange={(e) => handleChange(block.id, e.target.value)}
                placeholder="Écrivez votre texte ici..."
              />
            )}

            {block.type === "image" && (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 bg-[#101734] border-2 border-[#d4af37]/30 rounded px-3 py-2 focus:border-[#d4af37] focus:outline-none transition"
                    value={block.content}
                    onChange={(e) => handleChange(block.id, e.target.value)}
                    placeholder="URL de l'image"
                  />
                  <button
                    onClick={() => openImageSelector(block.id)}
                    className="bg-[#d4af37] hover:bg-[#f7da83] text-black font-semibold px-4 py-2 rounded transition whitespace-nowrap"
                  >
                    📁 Galerie
                  </button>
                </div>
                {block.content && (
                  <img
                    src={block.content}
                    alt="Aperçu"
                    className="w-full max-h-64 object-contain rounded mt-2 border border-[#d4af37]/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton flottant "+" */}
      <div className="fixed bottom-24 right-8 z-40">
        {showFloatingMenu && (
          <div className="mb-4 bg-[#0a1027] border-2 border-[#d4af37] rounded-lg shadow-2xl p-3 space-y-2 animate-fadeIn">
            <button
              onClick={() => addBlock("h1")}
              className="w-full text-left bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition font-semibold flex items-center gap-2"
            >
              <span className="text-xl">📌</span>
              <span>Titre H1</span>
            </button>
            <button
              onClick={() => addBlock("h2")}
              className="w-full text-left bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded transition font-semibold flex items-center gap-2"
            >
              <span className="text-xl">📍</span>
              <span>Titre H2</span>
            </button>
            <button
              onClick={() => addBlock("h3")}
              className="w-full text-left bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded transition font-semibold text-black flex items-center gap-2"
            >
              <span className="text-xl">📎</span>
              <span>Titre H3</span>
            </button>
            <button
              onClick={() => addBlock("p")}
              className="w-full text-left bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition font-semibold flex items-center gap-2"
            >
              <span className="text-xl">📝</span>
              <span>Paragraphe</span>
            </button>
            <button
              onClick={() => addBlock("image")}
              className="w-full text-left bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded transition font-semibold flex items-center gap-2"
            >
              <span className="text-xl">🖼️</span>
              <span>Image</span>
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold transition-all ${
            showFloatingMenu 
              ? "bg-red-500 hover:bg-red-600 rotate-45" 
              : "bg-[#d4af37] hover:bg-[#f7da83]"
          }`}
        >
          {showFloatingMenu ? "✕" : "+"}
        </button>
      </div>

      {/* Bouton Sauvegarder fixe en bas */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#d4af37] hover:bg-[#f7da83] text-black font-bold px-8 py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-2xl"
        >
          {saving ? "💾 Sauvegarde..." : "💾 Enregistrer"}
        </button>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setShowImageSelector(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}