"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  if (status === "loading") return <div className="p-8 text-white">Carregando...</div>;

  // Simple check. Real protection is done in the API and layout/middleware if needed
  if (!session?.user || !(session.user as any).isAdmin) {
    return (
      <div className="p-8 text-white text-center">
        <h1 className="text-2xl text-red-500 font-bold mb-4">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <button onClick={() => router.push("/")} className="mt-4 text-emerald-400 underline">Voltar para o site</button>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/poesiadeboteco/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao convidar usuário");
      }

      setMessage({ type: "success", text: `Convite enviado com sucesso para ${email}!` });
      setEmail("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Painel de Convites
        </h1>
        <p className="text-zinc-400 mb-8">
          Adicione um e-mail abaixo para gerar uma senha aleatória e enviar o acesso à audição.
        </p>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === "error" ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              E-mail do Convidado
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="contato@exemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Gerando e Enviando..." : "Convidar Usuário"}
          </button>
        </form>
      </div>
    </div>
  );
}
