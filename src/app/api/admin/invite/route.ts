import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    // Check if user is logged in and is admin
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // Generate random password (8 characters)
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user in DB
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: false,
      },
    });

    // Send email via Resend
    const loginUrl = "https://diegochorao.gaiolarecords.com.br/poesiadeboteco/login";
    
    await resend.emails.send({
      from: "Audição Diego Chorão <audicao@gaiolarecords.com.br>", // We need to make sure this domain is verified in Resend or use Resend's testing domain
      to: email,
      subject: "Seu Acesso Exclusivo à Audição",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; padding: 40px; border-radius: 10px;">
          <h1 style="color: #10b981; text-align: center;">Bem-vindo à Audição!</h1>
          <p style="font-size: 16px; color: #ccc;">Você foi convidado para ouvir com exclusividade o novo projeto do Diego Chorão.</p>
          <div style="background-color: #222; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #888;">Seus dados de acesso:</p>
            <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Senha:</strong> <span style="color: #10b981; font-size: 18px;">${randomPassword}</span></p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="background-color: #10b981; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acessar Agora</a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Convite enviado" });
  } catch (error: any) {
    console.error("Erro ao convidar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
