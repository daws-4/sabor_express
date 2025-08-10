import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Combos from "@/models/combos"; // Asegúrate de que la ruta a tu modelo sea correcta
import Productos from "@/models/productos"; // Importamos Productos para la validación

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

// GET: Obtener todos los combos del vendedor logueado
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
    const combos = await Combos.find({ id_usuarioVendedor: vendedorId })
      .populate("productos.producto", "nombre") // Poblar nombres de productos
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: combos });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo combo
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

    // --- Verificación de Propiedad de Productos ---
    const productIds = body.productos.map(
      (p: { producto: string }) => p.producto,
    );
    const productCount = await Productos.countDocuments({
      _id: { $in: productIds },
      id_usuarioVendedor: vendedorId,
    });

    if (productCount !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Intento de añadir un producto que no pertenece al vendedor.",
        },
        { status: 403 },
      );
    }
    // --- Fin de la Verificación ---

    const nuevoCombo = await Combos.create({
      ...body,
      id_usuarioVendedor: vendedorId,
    });

    return NextResponse.json(
      { success: true, data: nuevoCombo },
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

// PUT: Actualizar un combo existente
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
        { success: false, error: "ID de combo inválido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Verificación de Propiedad del Combo
    const comboExistente = await Combos.findOne({
      _id: id,
      id_usuarioVendedor: vendedorId,
    });

    if (!comboExistente) {
      return NextResponse.json(
        { success: false, error: "Combo no encontrado o no autorizado" },
        { status: 404 },
      );
    }

    // Verificación de Propiedad de los Productos (igual que en POST)
    const productIds = body.productos.map(
      (p: { producto: string }) => p.producto,
    );
    const productCount = await Productos.countDocuments({
      _id: { $in: productIds },
      id_usuarioVendedor: vendedorId,
    });

    if (productCount !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Intento de añadir un producto que no pertenece al vendedor.",
        },
        { status: 403 },
      );
    }

    const comboActualizado = await Combos.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: comboActualizado });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar un combo
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
        { success: false, error: "ID de combo inválido" },
        { status: 400 },
      );
    }

    // Verificación de propiedad antes de eliminar
    const comboEliminado = await Combos.findOneAndDelete({
      _id: id,
      id_usuarioVendedor: vendedorId,
    });

    if (!comboEliminado) {
      return NextResponse.json(
        { success: false, error: "Combo no encontrado o no autorizado" },
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
