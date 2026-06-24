import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Link from "next/link";
import DeleteUserButton from "../../components/DeleteUserButton";

const prisma = new PrismaClient();

export default async function AdminRelatorioPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).isAdmin) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { lastLoginAt: "desc" },
    include: {
      votes: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const totalUsers = users.length;
  const usersWithVotes = users.filter(u => u.votes.length > 0);
  const usersLogged = users.filter(u => u.lastLoginAt !== null);

  // Group by vote
  const voteCounts: Record<string, number> = {};
  usersWithVotes.forEach(u => {
    const track = u.votes[0].trackName;
    voteCounts[track] = (voteCounts[track] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b-2 border-emerald-600 pb-4">
          <h1 className="text-3xl font-black text-white">
            Relatório de Acessos e Votos
          </h1>
          <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 underline font-medium">
            &larr; Voltar para Convites
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-2">Estatísticas Gerais</h2>
            <div className="flex gap-8 mt-4">
              <div>
                <p className="text-sm text-zinc-400 uppercase font-bold">Total Logados</p>
                <p className="text-4xl font-black text-emerald-500">{usersLogged.length}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 uppercase font-bold">Total Votaram</p>
                <p className="text-4xl font-black text-blue-500">{usersWithVotes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Votos por Faixa</h2>
            {Object.keys(voteCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(voteCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([track, count]) => (
                  <div key={track} className="flex justify-between items-center bg-zinc-800 p-3 rounded">
                    <span className="font-bold text-zinc-200">{track}</span>
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {count} {count === 1 ? "voto" : "votos"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">Nenhum voto registrado ainda.</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold">Lista Detalhada de Convidados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b border-zinc-800">Nome</th>
                  <th className="p-4 border-b border-zinc-800">E-mail</th>
                  <th className="p-4 border-b border-zinc-800">Último Acesso</th>
                  <th className="p-4 border-b border-zinc-800 text-center">Progresso Máx.</th>
                  <th className="p-4 border-b border-zinc-800">Voto (Preferida)</th>
                  <th className="p-4 border-b border-zinc-800 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-800/50">
                    <td className="p-4 font-medium">{user.name || "-"}</td>
                    <td className="p-4 text-zinc-300">{user.email}</td>
                    <td className="p-4 text-zinc-400">
                      {user.lastLoginAt 
                        ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(user.lastLoginAt)
                        : "Nunca acessou"}
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-300">
                      {user.maxTrackIndex === 9 ? "Chegou no Voto" : `${user.maxTrackIndex + 1}/9`}
                    </td>
                    <td className="p-4">
                      {user.votes.length > 0 ? (
                        <span className="inline-block bg-blue-500/20 border border-blue-500/50 text-blue-300 px-2 py-1 rounded text-sm font-bold">
                          {user.votes[0].trackName}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">Não votou</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <DeleteUserButton userId={user.id} email={user.email} />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
