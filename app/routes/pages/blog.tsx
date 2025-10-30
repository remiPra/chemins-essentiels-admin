import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "posts"));
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">Articles du blog</h1>

      {posts.length === 0 ? (
        <p>Aucun article publié pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id} className="border border-[#d4af37]/20 p-4 rounded">
              <h2 className="text-xl font-semibold text-[#f7da83]">{p.title}</h2>
              <p className="text-gray-300 mt-1">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
