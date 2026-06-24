"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ userId, email }: { userId: string, email: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (email === "recordsgaiola@gmail.com") return null;

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o usuário ${email}?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/poesiadeboteco/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        router.refresh(); // Atualiza a tabela imediatamente
      } else {
        alert("Erro ao excluir usuário.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-colors disabled:opacity-50"
      title="Excluir Usuário"
    >
      {isDeleting ? "..." : <Trash2 size={18} />}
    </button>
  );
}
