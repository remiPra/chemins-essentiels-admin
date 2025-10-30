import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface Block {
  id: string;
  type: "h1" | "h2" | "h3" | "p" | "image";
  content: string;
}

interface PageData {
  blocks: Block[];
}

interface PageRendererProps {
  pageId: string;
}

export default function PageRenderer({ pageId }: PageRendererProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [pageId]);

  const fetchPage = async () => {
    setLoading(true);
    const ref = doc(db, "pages", pageId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setPage(snap.data() as PageData);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#d4af37] text-lg">⏳ Chargement de la page...</p>
      </div>
    );
  }

  if (!page || !page.blocks || page.blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-2xl mb-2">📄</p>
        <p>Cette page est vide.</p>
        <p className="text-sm">Passez en mode édition pour ajouter du contenu.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
      {page.blocks.map((block) => {
        switch (block.type) {
          case "h1":
            return (
              <h1 key={block.id} className="text-4xl md:text-5xl font-bold text-[#d4af37] mb-6 mt-8">
                {block.content || "Sans titre"}
              </h1>
            );
          case "h2":
            return (
              <h2 key={block.id} className="text-3xl md:text-4xl font-semibold text-[#f7da83] mb-4 mt-6">
                {block.content || "Sans titre"}
              </h2>
            );
          case "h3":
            return (
              <h3 key={block.id} className="text-2xl md:text-3xl font-medium text-white mb-3 mt-5">
                {block.content || "Sans titre"}
              </h3>
            );
          case "p":
            return (
              <p key={block.id} className="text-lg text-gray-300 leading-relaxed mb-4">
                {block.content || ""}
              </p>
            );
          case "image":
            return block.content ? (
              <div key={block.id} className="my-6">
                <img
                  src={block.content}
                  alt=""
                  className="w-full rounded-lg shadow-lg border border-[#d4af37]/20"
                />
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}