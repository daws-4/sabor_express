import { Schema, model, models } from "mongoose";

const productosSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del producto es requerido"],
      trim: true,
      index: true,
      maxlength: [100, "el nombre no puede exceder los 100 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede exceder los 1000 caracteres"],
    },
    marca: {
      type: String,
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["bebida", "comida", "otro"],
      required: [true, "El tipo de producto es requerido"],
    },
    // --- CAMPO CATEGORIA ACTUALIZADO ---
    // Ahora es una lista de opciones predefinidas (enum)
    categoria: {
      type: String,
      required: [true, "La categoría es requerida"],
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
    subcategoria: {
      type: String,
      trim: true,
    },
    contenido: {
      valor: { type: Number, required: true },
      unidad: {
        type: String,
        required: true,
        enum: ["ml", "L", "g", "kg", "unidades"],
      },
    },
    precio: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    stock: {
      type: Number,
      required: [true, "La cantidad en stock es requerida"],
      default: 0,
      min: 0,
    },
    imagenes: [
      {
        type: String,
        required: true,
      },
    ],
    id_usuarioVendedor: {
      type: Schema.Types.ObjectId,
      ref: "UsuariosVendedores",
      required: [true, "El ID del vendedor es requerido"],
      index: true,
    },
    publicado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Productos || model("Productos", productosSchema);
