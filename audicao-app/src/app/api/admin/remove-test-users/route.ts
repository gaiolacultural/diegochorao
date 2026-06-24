import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const emailsToDelete = ["lucasnobrega@gmail.com", "gaiolacultural@gmail.com"];

    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: emailsToDelete
        }
      }
    });

    return NextResponse.json({ success: true, message: `Foram excluídos ${result.count} usuários.`, emails: emailsToDelete });
  } catch (error: any) {
    console.error("Erro ao excluir usuários:", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}
