import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db"; // Asegúrate de que la ruta sea correcta
import Administradores from "@/models/administradores"; // Asegúrate de que la ruta sea correcta

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET(request: NextRequest) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: "Error de configuración del servidor." },
      { status: 500 },
    );
  }

  // Obtiene el token de la cookie de la petición
  const token = request.cookies.get("loginCookie")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "No autenticado: no se encontró el token." },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    // Verifica el token usando la clave secreta
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    const adminId = payload._id as string;

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Token inválido." },
        { status: 401 },
      );
    }

    // Busca al administrador en la base de datos para obtener los datos más actualizados
    const admin = await Administradores.findById(adminId)
      .select("rol estado")
      .lean();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Administrador no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: admin }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Sesión inválida o expirada." },
      { status: 401 },
    );
  }
}
