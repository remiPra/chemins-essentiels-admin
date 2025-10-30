// app/components/PageEditor.tsx
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function PageEditor({ pageId = "a-propos" }) {
  const [blocks, setBlocks] = useState([
    { id: Date.now(), type: "heading", content: "Titre de la page" },
  ]);
  const [saving, setSaving] = useState(false);

  const addBlock = (type) => {
    setBlocks([...blocks, { id: Date.now(), type, content: "" }]);
  };

  const handleChange = (id, value) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: value } : b)));
  };

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "pages", pageId), { blocks });
    setSaving(false);
    alert("✅ Page sauvegardée sur Firestore !");
  };

  const handleDelete = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">🪶 Éditeur de page : {pageId}</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => addBlock("heading")} className="bg-blue-500 px-3 py-1 rounded">+ Titre</button>
        <button onClick={() => addBlock("paragraph")} className="bg-green-500 px-3 py-1 rounded">+ Texte</button>
        <button onClick={() => addBlock("image")} className="bg-purple-500 px-3 py-1 rounded">+ Image</button>
      </div>

      {blocks.map((block) => (
        <div key={block.id} className="border border-gray-600 p-3 mb-3 rounded bg-gray-800">
          {block.type === "heading" && (
            <input
              type="text"
              className="w-full bg-transparent border-b border-gray-500 text-xl font-semibold"
              value={block.content}
              onChange={(e) => handleChange(block.id, e.target.value)}
              placeholder="Titre..."
            />
          )}
          {block.type === "paragraph" && (
            <textarea
              className="w-full bg-transparent border border-gray-600 mt-2 p-2 rounded"
              rows={3}
              value={block.content}
              onChange={(e) => handleChange(block.id, e.target.value)}
              placeholder="Texte..."
            />
          )}
          {block.type === "image" && (
            <input
              type="text"
              className="w-full bg-transparent border-b border-gray-500 mt-2"
              value={block.content}
              onChange={(e) => handleChange(block.id, e.target.value)}
              placeholder="URL de l'image (Cloudinary)"
            />
          )}
          <button
            onClick={() => handleDelete(block.id)}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Supprimer
          </button>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded"
      >
        {saving ? "💾 Sauvegarde..." : "💾 Enregistrer sur Firebase"}
      </button>
    </div>
  );
}
