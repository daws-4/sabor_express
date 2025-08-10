import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import usuariosVendedores from "@/models/usuariosVendedores";

// GET: Obtener todos los vendedores
export async function GET() {
  try {
    await connectDB();
    const vendedores = await usuariosVendedores.find({}).select("-password");

    return NextResponse.json(
      { success: true, data: vendedores },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo vendedor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Hashear la contraseña antes de guardarla
    if (body.password) {
      const salt = await bcrypt.genSalt(10);

      body.password = await bcrypt.hash(body.password, salt);
    }

    const vendedor = await usuariosVendedores.create(body);

    return NextResponse.json(
      { success: true, data: vendedor },
      { status: 201 },
    );
  } catch (error: any) {
    // --- MANEJO DE ERROR DE DUPLICADOS ---
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return NextResponse.json(
        {
          success: false,
          error: `El ${field} '${error.keyValue[field]}' ya está registrado.`,
        },
        { status: 409 }, // 409 Conflict es un buen código de estado para esto
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}

// PUT: Actualizar un vendedor existente
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
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

    const vendedor = await usuariosVendedores.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

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
  } catch (error: any) {
    // --- MANEJO DE ERROR DE DUPLICADOS ---
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return NextResponse.json(
        {
          success: false,
          error: `El ${field} '${error.keyValue[field]}' ya está registrado.`,
        },
        { status: 409 },
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar un vendedor
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const deletedVendedor = await usuariosVendedores.findByIdAndDelete(id);

    if (!deletedVendedor) {
      return NextResponse.json(
        { success: false, error: "Vendedor no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
