"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  if (status === "loading") return <div className="p-8 text-white">Carregando...</div>;

  // Simple check. Real protection is done in the API and layout/middleware if needed
  if (!session?.user || !(session.user as any).isAdmin) {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError("");
      setLoginLoading(true);
      const res = await signIn("credentials", {
        email: adminEmail,
        password: adminPassword,
        redirect: false,
      });
      if (res?.error) {
        setLoginError("E-mail ou senha incorretos.");
      }
      setLoginLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-8">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">Acesso Restrito</h1>
          {loginError && <p className="text-red-500 text-sm mb-4 text-center font-bold">{loginError}</p>}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail Administrativo</label>
              <input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="admin@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Senha</label>
              <input type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
              {loginLoading ? "Entrando..." : "Acessar Painel"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => router.push("/")} className="text-sm text-zinc-500 hover:text-emerald-400 underline transition-colors">Voltar para o site normal</button>
          </div>
        </div>
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
        body: JSON.stringify({ email, nome }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao convidar usuário");
      }

      setMessage({ type: "success", text: `Convite enviado com sucesso para ${nome} (${email})!` });
      setEmail("");
      setNome("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Painel de Convites
          </h1>
          <a href="/poesiadeboteco/admin/relatorio" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Ver Votos e Relatório
          </a>
        </div>
        <p className="text-zinc-400 mb-8">
          Adicione o nome e e-mail abaixo. Um e-mail de convite será enviado (agora sem senha, pois o acesso é só com o e-mail).
        </p>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === "error" ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Nome do Convidado (Ex: Lucas)
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Lucas"
            />
          </div>

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