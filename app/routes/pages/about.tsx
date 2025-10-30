import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AboutPage() {
  const [content, setContent] = useState({ title: "", text: "" });

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "content", "about");
      const snap = await getDoc(ref);
      if (snap.exists()) setContent(snap.data());
    };
    load();
  }, []);

  const handleChange = (e: any) =>
    setContent({ ...content, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const ref = doc(db, "content", "about");
    await updateDoc(ref, content);
    alert("✅ Page 'À propos' mise à jour !");
  };

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">À propos</h1>

      <label className="block mb-2 text-[#d4af37]">Titre</label>
      <input
        name="title"
        value={content.title}
        onChange={handleChange}
        className="w-full mb-4 p-3 rounded bg-[#101734] border border-[#d4af37]/30"
      />

      <label className="block mb-2 text-[#d4af37]">Texte</label>
      <textarea
        name="text"
        value={content.text}
        onChange={handleChange}
        className="w-full h-40 p-3 rounded bg-[#101734] border border-[#d4af37]/30 mb-6"
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
