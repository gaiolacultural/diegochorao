import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { trackIndex } = body;

    if (typeof trackIndex !== 'number') {
      return NextResponse.json({ error: "Índice inválido" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user && trackIndex > user.maxTrackIndex) {
      await prisma.user.update({
        where: { id: userId },
        data: { maxTrackIndex: trackIndex }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
