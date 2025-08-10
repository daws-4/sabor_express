// Ruta: app/api/dashboard/ofertas/route.ts

import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Ofertas from "@/models/ofertas"; // Importamos el modelo de Ofertas

const SECRET_KEY = process.env.SECRET_KEY;

// --- Helper para obtener el ID del vendedor (ya está en TS) ---
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

    // Aseguramos que el payload tiene una propiedad _id de tipo string
    return typeof payload._id === "string" ? payload._id : null;
  } catch (error) {
    return null;
  }
};

// --- GET: Obtener todas las ofertas del vendedor ---
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
    const ofertas = await Ofertas.find({ id_usuarioVendedor: vendedorId }).sort(
      { createdAt: -1 },
    );

    return NextResponse.json({ success: true, data: ofertas });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error del servidor al obtener ofertas." },
      { status: 500 },
    );
  }
}

// --- POST: Crear una nueva oferta ---
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
    const ofertaData = { ...body, id_usuarioVendedor: vendedorId };
    const nuevaOferta = await Ofertas.create(ofertaData);

    return NextResponse.json(
      { success: true, data: nuevaOferta },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error del servidor al crear la oferta." },
      { status: 500 },
    );
  }
}

// --- PUT: Actualizar una oferta existente ---
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
        { success: false, error: "ID de oferta inválido" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const ofertaActualizada = await Ofertas.findOneAndUpdate(
      { _id: id, id_usuarioVendedor: vendedorId },
      body,
      { new: true, runValidators: true },
    );

    if (!ofertaActualizada) {
      return NextResponse.json(
        { success: false, error: "Oferta no encontrada o no autorizado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: ofertaActualizada });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Error del servidor al actualizar la oferta." },
      { status: 500 },
    );
  }
}

// --- DELETE: Eliminar una oferta ---
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
        { success: false, error: "ID de oferta inválido" },
        { status: 400 },
      );
    }

    const ofertaEliminada = await Ofertas.findOneAndDelete({
      _id: id,
      id_usuarioVendedor: vendedorId,
    });

    if (!ofertaEliminada) {
      return NextResponse.json(
        { success: false, error: "Oferta no encontrada o no autorizado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Error del servidor al eliminar la oferta." },
      { status: 500 },
    );
  }
}
