import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

import UsuariosVendedores from "@/models/usuariosVendedores";
import { connectDB } from "@/lib/db";

const SECRET_KEY = process.env.SECRET_KEY;

// POST: Maneja el inicio de sesión de los usuariosVendedores
export async function POST(req: NextRequest) {
  if (!SECRET_KEY) {
    throw new Error("La clave secreta de JWT no está definida.");
  }

  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    // Busca al usuario por su email y se asegura de incluir la contraseña en el resultado
    const user = await UsuariosVendedores.findOne({ email }).select(
      "+password",
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "El usuario no existe." },
        { status: 404 },
      );
    }

    // Compara la contraseña enviada con la hasheada en la base de datos
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Contraseña incorrecta." },
        { status: 401 },
      );
    }

    // Si todo es correcto, crea el token JWT
    const token = await new SignJWT({
      _id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h") // El token expira en 2 horas
      .sign(new TextEncoder().encode(SECRET_KEY));

    // Guarda el token en una cookie segura
    (
      await // Guarda el token en una cookie segura
      cookies()
    ).set({
      name: "userSessionCookie",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 horas en segundos
    });

    return NextResponse.json(
      { success: true, message: "Inicio de sesión exitoso." },
      { status: 200 },
    );
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido.";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
