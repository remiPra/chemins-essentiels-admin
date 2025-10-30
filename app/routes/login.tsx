import { useState } from "react";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a1027] text-white">
      <h1 className="text-3xl font-bold mb-6 text-[#d4af37]">Admin Chemins Essentiels</h1>
      <form onSubmit={handleSubmit} className="bg-[#101734]/70 p-8 rounded-xl shadow-lg w-80">
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded bg-[#0a1027] border border-[#d4af37]/40"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-3 p-3 rounded bg-[#0a1027] border border-[#d4af37]/40"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-[#d4af37] text-black font-semibold rounded hover:bg-[#f7da83] transition"
        >
          Connexion
        </button>
      </form>
    </div>
  );
}
