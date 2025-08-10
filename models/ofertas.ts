import { Schema, model, models } from "mongoose";

const ofertasSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [
        true,
        "El nombre de la oferta es requerido (ej. 'Oferta de Verano')",
      ],
      trim: true,
    },
    // --- Propiedad de la Oferta ---
    id_usuarioVendedor: {
      type: Schema.Types.ObjectId,
      ref: "UsuariosVendedores",
      required: true,
      index: true,
    },
    // --- Tipo y Valor del Descuento ---
    tipo: {
      type: String,
      required: true,
      enum: ["PORCENTAJE", "MONTO_FIJO"], // Puedes expandir esto a "BOGO", "ENVIO_GRATIS", etc.
    },
    valor: {
      type: Number,
      required: [
        true,
        "El valor del descuento es requerido (ej. 15 para 15% o 5 para $5)",
      ],
      min: 0,
    },
    // --- A qué aplica la oferta (puedes usar uno o varios) ---
    productos_aplicables: [
      {
        type: Schema.Types.ObjectId,
        ref: "Productos",
      },
    ],
    combos_aplicables: [
      {
        type: Schema.Types.ObjectId,
        ref: "Combos",
      },
    ],
    // --- CAMPO CATEGORIAS_APLICABLES ACTUALIZADO ---
    categorias_aplicables: [
      {
        // Para aplicar a toda una categoría, ej. "Cervezas"
        type: String,
        trim: true,
        enum: [
          // Categorías de Bebidas
          "Cerveza",
          "Ron",
          "Whisky",
          "Vodka",
          "Tequila",
          "Ginebra",
          "Vino Tinto",
          "Vino Blanco",
          "Vino Rosado",
          "Aguardiente / Anisados",
          "Sangría / Cocteles Preparados",
          "Brandy / Coñac",
          "Licores / Cremas",
          "Champagne / Espumosos",
          "Bebidas sin Alcohol",
          // Categorías de Comida
          "Hamburguesas",
          "Perros Calientes (Hot Dogs)",
          "Pizzas",
          "Salchipapas / Papas Fritas",
          "Pepitos",
          "Empanadas",
          "Tacos / Burritos",
          "Tequeños / Dedos de Queso",
          "Shawarmas / Döner Kebab",
          "Alitas de Pollo / Costillas",
          "Parrilla / Pinchos",
          "Pastelitos",
          "Mazorcas / Elotes",
          "Dulces / Postres",
          "Snacks / Pasapalos",
        ],
      },
    ],
    // --- Condiciones de la Oferta ---
    fecha_inicio: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fecha_fin: {
      type: Date,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
// --- AÑADE ESTOS ÍNDICES AQUÍ ---
// Índice para la tarea de activación (busca por 'activo' y 'fecha_inicio')
ofertasSchema.index({ activo: 1, fecha_inicio: 1 });

// Índice para la tarea de desactivación (busca por 'activo' y 'fecha_fin')
ofertasSchema.index({ activo: 1, fecha_fin: 1 });

export default models.Ofertas || model("Ofertas", ofertasSchema);
