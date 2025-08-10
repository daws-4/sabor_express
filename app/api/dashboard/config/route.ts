import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db"; // Asegúrate de que la ruta sea correcta
import UsuariosVendedores from "@/models/usuariosVendedores"; // Asegúrate de que la ruta sea correcta

// La SECRET_KEY debe estar definida en tus variables de entorno (.env.local)
const SECRET_KEY = process.env.SECRET_KEY;

// --- Helper para obtener el ID del vendedor desde la cookie de sesión ---
const getVendedorIdFromSession = async (
  req: NextRequest,
): Promise<string | null> => {
  if (!SECRET_KEY) {
    console.error("La clave secreta de JWT no está definida.");

    return null;
  }

  // Usa la cookie correcta para la sesión del vendedor
  const token = req.cookies.get("userSessionCookie")?.value;

  if (!token) {
    return null; // No hay token, por lo tanto no hay sesión
  }

  try {
    // Verifica el token usando la clave secreta
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    // --- CORRECCIÓN ---
    // El _id puede venir como un objeto/buffer desde el token si no se convirtió a string al crearlo.
    // Esta función ahora maneja ambos casos para ser más robusta.
    const idFromPayload = payload._id as any;

    // Caso 1: El ID ya es un string (forma correcta)
    if (typeof idFromPayload === "string") {
      return idFromPayload;
    }

    // Caso 2: El ID es un objeto con un buffer (causa del error)
    if (
      typeof idFromPayload === "object" &&
      idFromPayload !== null &&
      idFromPayload.buffer
    ) {
      const byteArray = Object.values(idFromPayload.buffer) as number[];

      return Buffer.from(byteArray).toString("hex");
    }

    // Si el formato no es reconocido, se considera inválido.
    console.error("Formato de ID en token inválido:", idFromPayload);

    return null;
  } catch (error) {
    console.error("Error en la verificación del JWT del vendedor:", error);

    return null;
  }
};

// GET: Obtener los datos de configuración del vendedor actual
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const vendedorId = await getVendedorIdFromSession(req);

    if (!vendedorId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(vendedorId)) {
      return NextResponse.json(
        { success: false, error: "ID de sesión inválido" },
        { status: 400 },
      );
    }

    const vendedor =
      await UsuariosVendedores.findById(vendedorId).select("-password -pagos");

    if (!vendedor) {
      return NextResponse.json(
        { success: false, error: "Vendedor no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: vendedor },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// PUT: Actualizar los datos de configuración del vendedor actual
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const vendedorId = await getVendedorIdFromSession(req);

    if (!vendedorId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(vendedorId)) {
      return NextResponse.json(
        { success: false, error: "ID de sesión inválido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // No permitir que se actualicen campos sensibles desde esta ruta
    delete body.password;
    delete body.activo;
    delete body.pagos;
    delete body.email; // Un usuario no debería poder cambiar su email de login

    const updatedVendedor = await UsuariosVendedores.findByIdAndUpdate(
      vendedorId,
      body,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!updatedVendedor) {
      return NextResponse.json(
        { success: false, error: "Vendedor no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: updatedVendedor },
      { status: 200 },
    );
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}
