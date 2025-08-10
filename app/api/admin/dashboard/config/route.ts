import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db"; // Asegúrate de que la ruta sea correcta
import Administradores from "@/models/administradores"; // Asegúrate de que la ruta sea correcta

// La SECRET_KEY debe estar definida en tus variables de entorno (.env.local)
const SECRET_KEY = process.env.SECRET_KEY;

// Reemplaza la función de ejemplo con una verificación de JWT real
const getAdminIdFromSession = async (
  req: NextRequest,
): Promise<string | null> => {
  // Verifica que la clave secreta esté definida
  if (!SECRET_KEY) {
    return null;
  }

  // Obtiene el token de la cookie de la petición
  const token = req.cookies.get("loginCookie")?.value;

  if (!token) {
    return null; // No hay token, por lo tanto no hay sesión
  }

  try {
    // Verifica el token usando la clave secreta
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    // Asume que el payload del token contiene el ID del admin como `_id`
    return payload._id as string;
  } catch (error) {
    console.error("Error en la verificación del JWT:", error);

    return null;
  }
};

// GET: Obtener los datos del administrador actual
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const adminId = await getAdminIdFromSession(req);

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 },
      );
    }

    const admin = await Administradores.findById(adminId).select("-password"); // Excluir la contraseña

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: admin }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// PUT: Actualizar los datos del administrador actual
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const adminId = await getAdminIdFromSession(req);

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 },
      );
    }

    const currentAdmin = await Administradores.findById(adminId);

    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    const body = await req.json();

    // Si se envía una nueva contraseña, hashearla.
    if (body.password && body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);

      body.password = await bcrypt.hash(body.password, salt);
    } else {
      delete body.password; // No actualizar la contraseña si el campo está vacío
    }

    // Lógica de rol: Solo administradores con rol >= 5 pueden cambiar el estado.
    if (currentAdmin.rol < 5) {
      delete body.estado; // Elimina el campo 'estado' del cuerpo si el rol no es suficiente
    }

    const updatedAdmin = await Administradores.findByIdAndUpdate(
      adminId,
      body,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    return NextResponse.json(
      { success: true, data: updatedAdmin },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "El email o nombre de usuario ya existe." },
        { status: 409 },
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}
