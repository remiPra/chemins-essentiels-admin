import { useState } from "react";
import PageEditor from "../../components/PageEditor";
import PageRenderer from "../../components/PageRenderer";

export default function AboutPage() {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl text-[#d4af37] font-bold">💫 Page À propos</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMode("view")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              mode === "view"
                ? "bg-[#d4af37] text-black"
                : "bg-[#101734] text-gray-400 hover:text-white border border-[#d4af37]/30"
            }`}
          >
            👁️ Voir
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              mode === "edit"
                ? "bg-[#d4af37] text-black"
                : "bg-[#101734] text-gray-400 hover:text-white border border-[#d4af37]/30"
            }`}
          >
            ✏️ Modifier
          </button>
        </div>
      </div>

      <div className="bg-[#101734]/30 rounded-lg p-6 border border-[#d4af37]/20">
        {mode === "edit" ? (
          <PageEditor pageId="about" onSave={() => setMode("view")} />
        ) : (
          <PageRenderer pageId="about" />
        )}
      </div>
    </div>
  );
}