import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

export async function GET(req: Request) {
  try {
    // Check if there are any admins already
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Já existe um administrador no sistema. Por segurança, esta rota foi desativada." },
        { status: 403 }
      );
    }

    // Default admin details (can be changed later by logging into the database if needed, or we just provide these explicitly to the user now)
    const adminEmail = "lucas@gaiolarecords.com.br"; // Using standard email based on user context
    const adminPassword = "adminGaiola2026!";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin Gaiola",
        isAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Primeiro administrador criado com sucesso!",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      warning: "Por favor, guarde essas credenciais. Esta rota não funcionará novamente."
    });
  } catch (error: any) {
    console.error("Erro ao criar o primeiro admin:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
