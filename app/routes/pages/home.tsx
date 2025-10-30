import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function HomePage() {
  const [content, setContent] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroText: "",
  });

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "content", "homepage");
      const snap = await getDoc(ref);
      if (snap.exists()) setContent(snap.data());
    };
    load();
  }, []);

  const handleChange = (e: any) =>
    setContent({ ...content, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const ref = doc(db, "content", "homepage");
    await updateDoc(ref, content);
    alert("✅ Contenu de la page d’accueil mis à jour !");
  };

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">Page d’accueil</h1>

      <label className="block mb-2 text-[#d4af37]">Titre principal</label>
      <input
        name="heroTitle"
        value={content.heroTitle}
        onChange={handleChange}
        className="w-full mb-4 p-3 rounded bg-[#101734] border border-[#d4af37]/30"
      />

      <label className="block mb-2 text-[#d4af37]">Sous-titre</label>
      <input
        name="heroSubtitle"
        value={content.heroSubtitle}
        onChange={handleChange}
        className="w-full mb-4 p-3 rounded bg-[#101734] border border-[#d4af37]/30"
      />

      <label className="block mb-2 text-[#d4af37]">Texte principal</label>
      <textarea
        name="heroText"
        value={content.heroText}
        onChange={handleChange}
        className="w-full h-32 p-3 rounded bg-[#101734] border border-[#d4af37]/30 mb-6"
      />

      <button
        onClick={handleSave}
        className="bg-[#d4af37] text-black font-semibold px-6 py-3 rounded hover:bg-[#f7da83] transition"
      >
        💾 Enregistrer
      </button>
    </div>
  );
}
