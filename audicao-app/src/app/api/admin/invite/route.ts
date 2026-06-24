import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is logged in and is admin
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { email, nome } = await req.json();

    if (!email || !nome) {
      return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // Create user in DB
    await prisma.user.create({
      data: {
        email,
        name: nome,
        isAdmin: false,
      },
    });

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const loginUrl = "https://diegochorao.gaiolarecords.com.br/poesiadeboteco/login";
    // O ideal é a imagem estar hospedada no servidor para aparecer no email. 
    // Assumimos que a imagem será acessível neste link após o deploy:
    const imageUrl = "https://diegochorao.gaiolarecords.com.br/poesiadeboteco/EMAIL.png?v=2";
    
    await transporter.sendMail({
      from: `"Audição Diego Chorão" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Seu Acesso Exclusivo à Audição",
      html: `
        <div style="text-align: center; background-color: #ffffff; padding: 20px;">
          <!-- Envolvemos a imagem inteira com o link, assim se a pessoa clicar em qualquer lugar da imagem (incluindo o botão desenhado nela), ela vai pro login -->
          <a href="${loginUrl}" target="_blank" style="text-decoration: none;">
            <img src="${imageUrl}" alt="Convite Audição Diego Chorão" style="max-width: 600px; width: 100%; height: auto; border: none; display: block; margin: 0 auto;" />
          </a>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Convite enviado" });
  } catch (error: any) {
    console.error("Erro ao convidar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
