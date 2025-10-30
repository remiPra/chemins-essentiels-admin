import { useState } from "react";

export default function MediaPage() {
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chemins-essentiels");

    const res = await fetch("https://api.cloudinary.com/v1_1/<ton-cloud>/image/upload", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    setImageUrl(result.secure_url);
  };

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">Galerie d’images</h1>

      <input type="file" onChange={handleUpload} className="mb-6" />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="aperçu"
          className="rounded shadow-lg w-64 h-64 object-cover border border-[#d4af37]/30"
        />
      )}
    </div>
  );
}
