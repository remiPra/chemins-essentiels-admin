// app/components/PageRenderer.tsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function PageRenderer({ pageId = "a-propos" }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      const ref = doc(db, "pages", pageId);
      const snap = await getDoc(ref);
      if (snap.exists()) setPage(snap.data());
    };
    fetchPage();
  }, [pageId]);

  if (!page) return <p className="text-center text-gray-400">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      {page.blocks.map((block) => {
        if (block.type === "heading")
          return <h2 key={block.id} className="text-3xl font-bold mb-3">{block.content}</h2>;
        if (block.type === "paragraph")
          return <p key={block.id} className="mb-4 text-lg">{block.content}</p>;
        if (block.type === "image")
          return <img key={block.id} src={block.content} alt="" className="w-full rounded-lg mb-5" />;
        return null;
      })}
    </div>
  );
}
