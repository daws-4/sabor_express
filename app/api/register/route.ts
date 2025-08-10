import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db"; // Asegúrate de que la ruta sea correcta
import UsuariosVendedores from "@/models/usuariosVendedores"; // Asegúrate de que la ruta sea correcta

// POST: Maneja la creación de una nueva solicitud de registro de vendedor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Valida que la contraseña exista y no esté vacía
    if (!body.password || body.password.trim() === "") {
      return NextResponse.json(
        { success: false, error: "La contraseña es obligatoria." },
        { status: 400 },
      );
    }

    // Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);

    body.password = await bcrypt.hash(body.password, salt);

    // Asegurarse de que el estado 'activo' sea 'false' por defecto al registrarse.
    // El administrador lo activará después de la verificación y el pago.
    body.activo = false;

    // Crear el nuevo usuario vendedor en la base de datos
    const nuevaSolicitud = await UsuariosVendedores.create(body);

    return NextResponse.json(
      {
        success: true,
        message:
          "Solicitud de registro enviada con éxito. Nuestro equipo se pondrá en contacto contigo.",
        data: nuevaSolicitud,
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Maneja errores de duplicados (ej. email o username)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]; // Obtiene el campo que causó el error

      return NextResponse.json(
        {
          success: false,
          error: `El ${field} '${error.keyValue[field]}' ya está registrado.`,
        },
        { status: 409 },
      );
    }
    // Maneja otros errores de validación de Mongoose
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Manejo de errores genéricos
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocurrió un error desconocido en el servidor.";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
