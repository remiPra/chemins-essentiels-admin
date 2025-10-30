import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import PageEditor from "../../components/PageEditor";
import PageRenderer from "../../components/PageRenderer";

interface Post {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit" | "view">("list");
  const [newPostTitle, setNewPostTitle] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const snap = await getDocs(collection(db, "blogPosts"));
    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    })) as Post[];
    setPosts(items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const createNewPost = async () => {
    if (!newPostTitle.trim()) {
      alert("⚠️ Veuillez entrer un titre");
      return;
    }

    const slug = `post-${Date.now()}`;
    await addDoc(collection(db, "blogPosts"), {
      title: newPostTitle,
      slug,
      createdAt: new Date(),
    });

    setNewPostTitle("");
    await loadPosts();
    setSelectedPost(slug);
    setMode("edit");
  };

  const deletePost = async (postId: string, slug: string) => {
    if (!confirm("Supprimer cet article ?")) return;

    await deleteDoc(doc(db, "blogPosts", postId));
    // Optionnel : supprimer aussi la page du contenu
    try {
      await deleteDoc(doc(db, "pages", slug));
    } catch (e) {
      // Page n'existe peut-être pas encore
    }
    await loadPosts();
    setSelectedPost(null);
    setMode("list");
  };

  if (mode === "edit" && selectedPost) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => {
              setMode("list");
              setSelectedPost(null);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-2xl text-[#d4af37] font-bold">
            ✏️ Édition de l'article
          </h1>
        </div>
        <div className="bg-[#101734]/30 rounded-lg p-6 border border-[#d4af37]/20">
          <PageEditor 
            pageId={selectedPost} 
            onSave={() => {
              alert("✅ Article sauvegardé !");
              setMode("view");
            }} 
          />
        </div>
      </div>
    );
  }

  if (mode === "view" && selectedPost) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => {
              setMode("list");
              setSelectedPost(null);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ← Retour à la liste
          </button>
          <button
            onClick={() => setMode("edit")}
            className="px-4 py-2 bg-[#d4af37] text-black font-semibold rounded hover:bg-[#f7da83] transition"
          >
            ✏️ Modifier
          </button>
        </div>
        <div className="bg-[#101734]/30 rounded-lg p-6 border border-[#d4af37]/20">
          <PageRenderer pageId={selectedPost} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-[#d4af37] mb-6 font-bold">📝 Articles du blog</h1>

      <div className="mb-8 p-6 bg-[#101734]/50 rounded-lg border border-[#d4af37]/20">
        <h2 className="text-xl text-[#d4af37] font-semibold mb-3">
          ✨ Créer un nouvel article
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createNewPost()}
            placeholder="Titre du nouvel article..."
            className="flex-1 px-4 py-2 rounded bg-[#0a1027] border border-[#d4af37]/30 focus:border-[#d4af37] focus:outline-none"
          />
          <button
            onClick={createNewPost}
            className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded hover:bg-[#f7da83] transition"
          >
            + Créer
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-2xl mb-2">📝</p>
          <p>Aucun article publié pour le moment.</p>
          <p className="text-sm">Créez votre premier article ci-dessus !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-[#d4af37]/20 p-5 rounded-lg bg-[#101734]/30 hover:border-[#d4af37]/50 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-[#f7da83] mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    📅 Créé le {post.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPost(post.slug);
                      setMode("view");
                    }}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition text-sm"
                  >
                    👁️ Voir
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post.slug);
                      setMode("edit");
                    }}
                    className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] rounded hover:bg-[#d4af37]/30 transition text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => deletePost(post.id, post.slug)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm"
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