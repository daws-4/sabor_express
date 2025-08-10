import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

import { connectDB } from "@/lib/db";
import Administradores from "@/models/administradores";

const SECRET_KEY = process.env.SECRET_KEY;

// --- Función de Verificación de JWT y Rol ---
// Esta función verifica el token y asegura que el usuario tenga el rol requerido (rol 5)
const verifyAdminAccess = async (req: NextRequest) => {
  if (!SECRET_KEY) {
    throw new Error("La clave secreta de JWT no está definida.");
  }
  const token = req.cookies.get("loginCookie")?.value;

  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    // Solo permite el acceso si el rol es 5
    if (payload.rol === 5) {
      return payload as { _id: string; rol: number };
    }

    return null; // No tiene los permisos necesarios
  } catch (error) {
    return null;
  }
};

// GET: Obtener todos los administradores (solo para rol 5)
export async function GET(req: NextRequest) {
  const adminSession = await verifyAdminAccess(req);

  if (!adminSession) {
    return NextResponse.json(
      { success: false, error: "Acceso no autorizado" },
      { status: 403 },
    );
  }

  try {
    await connectDB();
    const admins = await Administradores.find({}).select("-password");

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo administrador (solo para rol 5)
export async function POST(req: NextRequest) {
  const adminSession = await verifyAdminAccess(req);

  if (!adminSession) {
    return NextResponse.json(
      { success: false, error: "Acceso no autorizado" },
      { status: 403 },
    );
  }

  try {
    await connectDB();
    const body = await req.json();

    if (!body.password) {
      return NextResponse.json(
        { success: false, error: "La contraseña es obligatoria" },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);

    body.password = await bcrypt.hash(body.password, salt);

    const newAdmin = await Administradores.create(body);

    return NextResponse.json(
      { success: true, data: newAdmin },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "El email o nombre de usuario ya existe." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// PUT: Actualizar un administrador (solo para rol 5)
export async function PUT(req: NextRequest) {
  const adminSession = await verifyAdminAccess(req);

  if (!adminSession) {
    return NextResponse.json(
      { success: false, error: "Acceso no autorizado" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const body = await req.json();

    if (body.password && body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);

      body.password = await bcrypt.hash(body.password, salt);
    } else {
      delete body.password;
    }

    const updatedAdmin = await Administradores.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedAdmin });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "El email o nombre de usuario ya existe." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar un administrador (solo para rol 5)
export async function DELETE(req: NextRequest) {
  const adminSession = await verifyAdminAccess(req);

  if (!adminSession) {
    return NextResponse.json(
      { success: false, error: "Acceso no autorizado" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Medida de seguridad: No permitir que un admin se elimine a sí mismo
    if (id === adminSession._id) {
      return NextResponse.json(
        { success: false, error: "No puedes eliminar tu propia cuenta." },
        { status: 403 },
      );
    }

    const deletedAdmin = await Administradores.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 },
    );
  }
}
