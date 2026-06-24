"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      
      {/* Background (Wood texture) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ 
          backgroundImage: "url('/poesiadeboteco/FUNDO.jpg')",
          filter: "sepia(0.4) contrast(1.1) brightness(0.6) saturate(1.2)" 
        }}
      />

      {/* Scrollable Container (only vertical scroll if screen is too small) */}
      <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start pt-[15vh] md:justify-center md:pt-0">
        
        {/* Container responsivo da imagem */}
        <div className="relative w-[90%] sm:w-[85%] md:w-full max-w-xl mx-auto flex-shrink-0">
        
        {/* Imagem de Fundo (usando tag img normal para herdar proporção) */}
        <img 
          src="/poesiadeboteco/login-bg.png" 
          alt="Login Poesia de Boteco" 
          className="w-full h-auto block select-none pointer-events-none"
        />

        {/* Formulário Overlay */}
        <form onSubmit={handleSubmit} className="absolute inset-0 w-full h-full">
          
          {error && (
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[80%] bg-red-500/90 text-white p-2 rounded text-center font-bold text-sm sm:text-base z-10 shadow-lg">
              {error}
            </div>
          )}

          {/* Campo Email - Posicionado sobre o espaço "EMAIL:" na imagem */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="absolute top-[49%] left-[32%] w-[58%] h-[8%] bg-transparent border-b-2 border-transparent hover:border-black/30 focus:border-black/50 text-black/80 font-bold text-base sm:text-lg md:text-xl px-2 focus:outline-none transition-colors"
            placeholder=""
          />

          {/* Campo Senha - Posicionado sobre o espaço "SENHA:" na imagem */}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="absolute top-[67%] left-[32%] w-[58%] h-[8%] bg-transparent border-b-2 border-transparent hover:border-black/30 focus:border-black/50 text-black/80 font-bold text-base sm:text-lg md:text-xl px-2 focus:outline-none transition-colors"
            placeholder=""
          />

          {/* Botão Entrar Invisível */}
          <button
            type="submit"
            disabled={loading}
            className="absolute top-[80%] left-[35%] w-[30%] h-[15%] bg-transparent hover:bg-black/10 active:bg-black/20 rounded-full cursor-pointer transition-colors focus:outline-none flex items-center justify-center disabled:opacity-50"
            aria-label="Acessar Audição"
          >
            {loading && (
              <div className="w-6 h-6 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
}
