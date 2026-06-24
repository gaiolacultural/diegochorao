import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Tenta adicionar a coluna manualmente no banco SQLite blindado
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN maxTrackIndex INTEGER NOT NULL DEFAULT 0;`);
    
    return NextResponse.json({ success: true, message: "Banco de dados atualizado com sucesso (Coluna maxTrackIndex adicionada)." });
  } catch (error: any) {
    // Se a coluna já existir, ele vai dar erro, o que significa que já está atualizado
    if (error.message.includes("duplicate column name")) {
      return NextResponse.json({ success: true, message: "A coluna já existia. Tudo pronto!" });
    }
    
    console.error("Erro ao atualizar DB:", error);
    return NextResponse.json({ error: "Erro ao atualizar: " + error.message }, { status: 500 });
  }
}
