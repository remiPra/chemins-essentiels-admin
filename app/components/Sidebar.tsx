import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard/home", label: "🏠 Accueil" },
    { to: "/dashboard/about", label: "💫 À propos" },
    { to: "/dashboard/blog", label: "📝 Blog" },
    { to: "/dashboard/media", label: "🖼️ Images" },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-white min-h-screen p-6">
      <h2 className="text-xl text-[#d4af37] font-bold mb-8">Chemins Essentiels</h2>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className={`block p-2 rounded ${
                location.pathname === l.to
                  ? "bg-[#d4af37] text-black"
                  : "hover:bg-[#1e293b]"
              }`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
