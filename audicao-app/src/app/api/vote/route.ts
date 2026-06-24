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
    const { trackName } = body;

    if (!trackName) {
      return NextResponse.json(
        { error: "Nome da música é obrigatório" },
        { status: 400 }
      );
    }

    // Check if user already voted (optional, but good practice to prevent multiple votes or just update the existing one)
    const existingVote = await prisma.vote.findFirst({
      where: { userId: (session.user as any).id }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { trackName }
      });
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          trackName,
          userId: (session.user as any).id
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar voto:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar voto" },
      { status: 500 }
    );
  }
}
