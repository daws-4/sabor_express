import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import UsuariosDelivery from "@/models/usuariosDelivery"; // Ajusta la ruta a tu modelo

// GET: Obtener todos los repartidores
export async function GET() {
  try {
    await connectDB();
    const deliveryUsers = await UsuariosDelivery.find({});

    if (!deliveryUsers || deliveryUsers.length === 0) {
      console.log(deliveryUsers);

      return NextResponse.json(
        { success: false, error: "No se encontraron repartidores" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: deliveryUsers },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo repartidor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Hashear la contraseña antes de guardarla
    if (body.password) {
      const salt = await bcrypt.genSalt(10);

      body.password = await bcrypt.hash(body.password, salt);
    } else {
      return NextResponse.json(
        { success: false, error: "La contraseña es obligatoria" },
        { status: 400 },
      );
    }

    // El campo 'estado' se recibe del body y se guarda directamente
    // El 'estado_operativo' usará el valor por defecto del schema
    delete body.estado_operativo;

    const deliveryUser = await UsuariosDelivery.create(body);

    return NextResponse.json(
      { success: true, data: deliveryUser },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "El email o la cédula ya existen." },
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

// PUT: Actualizar un repartidor existente
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

    if (body.password) {
      const salt = await bcrypt.genSalt(10);

      body.password = await bcrypt.hash(body.password, salt);
    } else {
      delete body.password;
    }

    // El campo 'estado' se actualiza si viene en el body
    // No se permite la actualización del 'estado_operativo' desde este formulario
    delete body.estado_operativo;

    const deliveryUser = await UsuariosDelivery.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!deliveryUser) {
      return NextResponse.json(
        { success: false, error: "Repartidor no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: deliveryUser },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar un repartidor
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

    const deletedUser = await UsuariosDelivery.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: "Repartidor no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
