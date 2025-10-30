import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
}

export default function MediaPage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const snap = await getDocs(collection(db, "media"));
    const items = snap.docs.map((d) => ({ 
      id: d.id, 
      ...d.data(),
      uploadedAt: d.data().uploadedAt?.toDate() || new Date()
    })) as MediaItem[];
    setImages(items);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chemins-essentiels");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/djna9jor7/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      
      // Sauvegarder dans Firestore
      await addDoc(collection(db, "media"), {
        url: result.secure_url,
        name: file.name,
        uploadedAt: new Date(),
      });

      await loadImages();
      alert("✅ Image uploadée avec succès !");
    } catch (error) {
      alert("❌ Erreur lors de l'upload");
      console.error(error);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    await deleteDoc(doc(db, "media", id));
    await loadImages();
    alert("✅ Image supprimée");
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSelectedImage(url);
    setTimeout(() => setSelectedImage(null), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">🖼️ Galerie d'images</h1>

      <div className="mb-8 p-6 bg-[#101734]/50 rounded-lg border border-[#d4af37]/20">
        <label className="block mb-3 text-[#d4af37] font-semibold">
          📤 Uploader une nouvelle image
        </label>
        <input 
          type="file" 
          onChange={handleUpload} 
          disabled={uploading}
          accept="image/*"
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-[#d4af37] file:text-black
            hover:file:bg-[#f7da83] file:cursor-pointer
            disabled:opacity-50"
        />
        {uploading && <p className="mt-2 text-[#d4af37]">⏳ Upload en cours...</p>}
      </div>

      {images.length === 0 ? (
        <p className="text-gray-400">Aucune image pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div 
              key={img.id} 
              className="relative group bg-[#101734]/50 rounded-lg overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37] transition"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <p className="text-xs text-gray-400 truncate mb-2">{img.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="flex-1 text-xs bg-[#d4af37] text-black px-2 py-1 rounded hover:bg-[#f7da83] transition"
                  >
                    {selectedImage === img.url ? "✓ Copié !" : "📋 Copier URL"}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}