import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db"; // Asegúrate de que la ruta sea correcta
import Pedidos from "@/models/pedidos"; // Asegúrate de que la ruta a tu modelo sea correcta

export async function GET() {
  try {
    await connectDB();

    // --- 1. Calcular Métricas Generales ---
    const totalPedidos = await Pedidos.countDocuments();
    const pedidosTerminados = await Pedidos.countDocuments({
      status: "entregado",
    });
    const pedidosCancelados = await Pedidos.countDocuments({
      status: "cancelado",
    });

    // --- 2. Calcular Ganancias Totales (solo de pedidos entregados) ---
    const gananciasResult = await Pedidos.aggregate([
      { $match: { status: "entregado" } },
      { $group: { _id: null, total: { $sum: "$montoTotal" } } },
    ]);
    const totalGanancias =
      gananciasResult.length > 0 ? gananciasResult[0].total : 0;

    // --- 3. Obtener los 5 Pedidos Pendientes más Recientes ---
    const pedidosPendientes = await Pedidos.find({ status: "pendiente" })
      .sort({ createdAt: -1 }) // -1 para orden descendente (más recientes primero)
      .limit(5)
      .populate("usuario", "nombre apellido") // Obtiene nombre y apellido del usuario
      .populate("id_usuarioVendedor", "nombre") // Obtiene el nombre del vendedor
      .lean();

    // --- 4. Preparar Datos para los Gráficos (ej. por estado) ---
    const datosGraficoStatus = await Pedidos.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
    ]);

    // --- 5. Preparar Datos para Gráfico de Ganancias Mensuales ---
    const datosGraficoGanancias = await Pedidos.aggregate([
      { $match: { status: "entregado" } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupar por mes
          ganancias: { $sum: "$montoTotal" },
        },
      },
      { $sort: { _id: 1 } }, // Ordenar por mes
      {
        $project: {
          mes: "$_id",
          ganancias: 1,
          _id: 0,
        },
      },
    ]);

    // Mapear número del mes a nombre del mes
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const gananciasMensuales = datosGraficoGanancias.map((item) => ({
      ...item,
      mes: monthNames[item.mes - 1],
    }));

    // --- Ensamblar la respuesta ---
    const responseData = {
      metricas: {
        totalPedidos,
        pedidosTerminados,
        pedidosCancelados,
        totalGanancias,
      },
      pedidosPendientes,
      graficos: {
        status: datosGraficoStatus,
        ganancias: gananciasMensuales,
      },
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocurrió un error desconocido";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
