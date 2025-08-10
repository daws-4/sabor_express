import cron from "node-cron";

import { connectDB } from "@/lib/db";
import Ofertas from "@/models/ofertas";

/**
 * Activa las ofertas cuya fecha de inicio ya pasó y que están inactivas.
 */
const activarOfertasProgramadas = async () => {
  console.log(`[NODE-CRON] Ejecutando tarea: 'activarOfertasProgramadas'...`);
  try {
    await connectDB();
    const ahora = new Date();

    // Comando para actualizar ofertas inactivas cuya fecha de inicio ya es hora.
    const resultado = await Ofertas.updateMany(
      { activo: false, fecha_inicio: { $lte: ahora } }, // $lte (menor o igual que) para incluir las que empiezan ahora mismo.
      { $set: { activo: true } },
    );

    if (resultado.modifiedCount > 0) {
      console.log(
        `[NODE-CRON] Tarea finalizada. Ofertas activadas: ${resultado.modifiedCount} ${ahora}`,
      );
    }
  } catch (error) {
    console.error(
      "[NODE-CRON ERROR] No se pudo completar la tarea de activación:",
      error,
    );
  }
};

/**
 * Desactiva las ofertas activas cuya fecha de fin ya pasó.
 */
const desactivarOfertasVencidas = async () => {
  console.log(`[NODE-CRON] Ejecutando tarea: 'desactivarOfertasVencidas'...`);
  try {
    await connectDB();
    const ahora = new Date();

    const resultado = await Ofertas.updateMany(
      { activo: true, fecha_fin: { $lt: ahora } },
      { $set: { activo: false } },
    );

    if (resultado.modifiedCount > 0) {
      console.log(
        `[NODE-CRON] Tarea finalizada. Ofertas desactivadas: ${resultado.modifiedCount} ${ahora}`,
      );
    }
  } catch (error) {
    console.error(
      "[NODE-CRON ERROR] No se pudo completar la tarea de desactivación:",
      error,
    );
  }
};

/**
 * Inicia todas las tareas programadas del servidor.
 */
export const iniciarTareasProgramadas = () => {
  console.log("-> Iniciando tareas programadas...");

  // Tarea para activar y desactivar ofertas cada minuto.
  cron.schedule(
    "*/1 * * * *",
    () => {
      // Se ejecutan ambas funciones en el mismo intervalo.
      activarOfertasProgramadas();
      desactivarOfertasVencidas();
    },
    {
      timezone: "America/Caracas",
    },
  );
};
