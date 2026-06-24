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

    const loginUrl = "https://diegochorao.gaiolarecords.com.br/poesiadeboteco/login";
    const imageUrl = "https://diegochorao.gaiolarecords.com.br/poesiadeboteco/EMAIL.png?v=2";
    
    const subjectLine = "Seu Acesso Exclusivo à Audição - Diego Chorão";
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; color: #333333;">
          <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">Olá <strong>${nome}</strong>, você recebeu um convite exclusivo para a audição do novo projeto do <strong>Diego Chorão</strong>.</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" target="_blank" style="text-decoration: none;">
              <img src="${imageUrl}" alt="Convite Audição Diego Chorão" style="width: 100%; height: auto; border: none; display: block; margin: 0 auto;" />
            </a>
          </div>

          <p style="font-size: 14px; margin-top: 30px; text-align: center; color: #666666;">
            Se o botão na imagem não funcionar, acesse diretamente por este link:<br>
            <a href="${loginUrl}" style="color: #000000;">${loginUrl}</a>
          </p>
          <p style="font-size: 12px; margin-top: 20px; text-align: center; color: #999999;">
            Por favor, utilize o seu e-mail cadastrado (${email}) para fazer o acesso.<br>
            © Gaiola Records
          </p>
        </div>
      `;

    if (process.env.RESEND_API_KEY) {
      // Envio Profissional Anti-Spam via Resend
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const fromEmail = process.env.EMAIL_FROM || "contato@gaiolarecords.com.br";
      
      const resendData = await resend.emails.send({
        from: `Audição Diego Chorão <${fromEmail}>`,
        to: email,
        subject: subjectLine,
        html: htmlContent,
      });

      if (resendData.error) {
        throw new Error(resendData.error.message);
      }
    } else {
      // Fallback para o envio antigo via Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Audição Diego Chorão" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subjectLine,
        html: htmlContent,
      });
    }

    return NextResponse.json({ success: true, message: "Convite enviado" });
  } catch (error: any) {
    console.error("Erro ao convidar:", error);
    return NextResponse.json({ error: "Erro interno do servidor: " + error.message, stack: error.stack }, { status: 500 });
  }
}
