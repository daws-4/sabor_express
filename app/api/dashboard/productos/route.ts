import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Productos from "@/models/productos"; // Asegúrate de que la ruta a tu modelo sea correcta

const SECRET_KEY = process.env.SECRET_KEY;

// --- Helper para obtener el ID del vendedor desde la cookie de sesión ---
const getVendedorIdFromSession = async (
  req: NextRequest,
): Promise<string | null> => {
  if (!SECRET_KEY) return null;
  const token = req.cookies.get("userSessionCookie")?.value;

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    return payload._id as string;
  } catch (error) {
    return null;
  }
};

// GET: Obtener todos los productos del vendedor logueado
export async function GET(req: NextRequest) {
  const vendedorId = await getVendedorIdFromSession(req);

  if (!vendedorId) {
    return NextResponse.json(
      { success: false, error: "No autenticado" },
      { status: 401 },
    );
  }

  try {
    await connectDB();
    const productos = await Productos.find({
      id_usuarioVendedor: vendedorId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: productos });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo producto
export async function POST(req: NextRequest) {
  const vendedorId = await getVendedorIdFromSession(req);

  if (!vendedorId) {
    return NextResponse.json(
      { success: false, error: "No autenticado" },
      { status: 401 },
    );
  }

  try {
    await connectDB();
    const body = await req.json();
    // Asegurarse de que el producto se asigne al vendedor correcto
    const nuevoProducto = await Productos.create({
      ...body,
      id_usuarioVendedor: vendedorId,
    });

    return NextResponse.json(
      { success: true, data: nuevoProducto },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 },
    );
  }
}

// PUT: Actualizar un producto existente
export async function PUT(req: NextRequest) {
  const vendedorId = await getVendedorIdFromSession(req);

  if (!vendedorId) {
    return NextResponse.json(
      { success: false, error: "No autenticado" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Verificación de propiedad: Asegurarse de que el producto pertenece al vendedor
    const productoExistente = await Productos.findOne({
      _id: id,
      id_usuarioVendedor: vendedorId,
    });

    if (!productoExistente) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado o no autorizado" },
        { status: 404 },
      );
    }

    const productoActualizado = await Productos.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: productoActualizado });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar un producto
export async function DELETE(req: NextRequest) {
  const vendedorId = await getVendedorIdFromSession(req);

  if (!vendedorId) {
    return NextResponse.json(
      { success: false, error: "No autenticado" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido" },
        { status: 400 },
      );
    }

    // Verificación de propiedad antes de eliminar
    const productoEliminado = await Productos.findOneAndDelete({
      _id: id,
      id_usuarioVendedor: vendedorId,
    });

    if (!productoEliminado) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado o no autorizado" },
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
