import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
      // Page vide par défaut
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

  if (loading) {
    return <div className="text-center text-[#d4af37]">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 p-4 bg-[#101734]/50 rounded-lg border border-[#d4af37]/20">
        <h2 className="text-xl text-[#d4af37] font-bold mb-3">
          ✏️ Ajouter un bloc
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addBlock("h1")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition font-semibold"
          >
            + Titre H1
          </button>
          <button
            onClick={() => addBlock("h2")}
            className="bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded transition font-semibold"
          >
            + Titre H2
          </button>
          <button
            onClick={() => addBlock("h3")}
            className="bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded transition font-semibold text-black"
          >
            + Titre H3
          </button>
          <button
            onClick={() => addBlock("p")}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition font-semibold"
          >
            + Paragraphe
          </button>
          <button
            onClick={() => addBlock("image")}
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded transition font-semibold"
          >
            + Image
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="border-2 border-[#d4af37]/30 p-4 rounded-lg bg-[#0a1027] hover:border-[#d4af37] transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#d4af37] font-semibold uppercase">
                {block.type === "h1" && "📌 Titre principal (H1)"}
                {block.type === "h2" && "📍 Sous-titre (H2)"}
                {block.type === "h3" && "📎 Petit titre (H3)"}
                {block.type === "p" && "📝 Paragraphe"}
                {block.type === "image" && "🖼️ Image"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => moveBlock(block.id, "up")}
                  disabled={index === 0}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ⬆️
                </button>
                <button
                  onClick={() => moveBlock(block.id, "down")}
                  disabled={index === blocks.length - 1}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition"
                >
                  🗑️ Supprimer
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
                <input
                  type="text"
                  className="w-full bg-[#101734] border-2 border-[#d4af37]/30 rounded px-3 py-2 mb-2 focus:border-[#d4af37] focus:outline-none transition"
                  value={block.content}
                  onChange={(e) => handleChange(block.id, e.target.value)}
                  placeholder="Collez l'URL de l'image (depuis la galerie media)"
                />
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
                <p className="text-xs text-gray-500 mt-2">
                  💡 Astuce : Allez dans "🖼️ Images" pour uploader et copier l'URL
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 bg-[#0a1027] p-4 rounded-lg border-2 border-[#d4af37]/30 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#d4af37] hover:bg-[#f7da83] text-black font-bold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {saving ? "💾 Sauvegarde en cours..." : "💾 Enregistrer la page"}
        </button>
      </div>
    </div>
  );
}