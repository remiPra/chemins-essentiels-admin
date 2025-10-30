import PageEditor from "../components/PageEditor";
import PageRenderer from "../components/PageRenderer";
import { useState } from "react";

export default function APropos() {
  const [mode, setMode] = useState("view");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex justify-center gap-4 py-4">
        <button
          onClick={() => setMode("view")}
          className={`px-4 py-2 rounded ${mode === "view" ? "bg-green-600" : "bg-gray-700"}`}
        >
          👁️ Voir
        </button>
        <button
          onClick={() => setMode("edit")}
          className={`px-4 py-2 rounded ${mode === "edit" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          ✏️ Modifier
        </button>
      </div>

      {mode === "edit" ? <PageEditor pageId="a-propos" /> : <PageRenderer pageId="a-propos" />}
    </div>
  );
}
