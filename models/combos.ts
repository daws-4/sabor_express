import { Schema, model, models } from "mongoose";

// Sub-esquema para definir qué productos y en qué cantidad componen el combo.
const comboProductoSchema = new Schema(
  {
    producto: {
      type: Schema.Types.ObjectId,
      ref: "Productos", // Referencia directa al modelo de Productos
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, "La cantidad del producto en el combo debe ser al menos 1"],
      default: 1,
    },
  },
  { _id: false }
);

const combosSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del combo es requerido"],
      trim: true,
      index: true,
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder los 500 caracteres"],
    },
    // Campo clave que asigna el combo a un vendedor específico.
    id_usuarioVendedor: {
      type: Schema.Types.ObjectId,
      ref: "UsuariosVendedores",
      required: true,
      index: true,
    },
    // Arreglo que define la composición del combo.
    productos: [comboProductoSchema],

    // Precio base del combo. El precio final con descuento se calculará
    // buscando ofertas activas que apliquen a este combo.
    precio: {
      type: Number,
      required: [true, "El precio base es requerido"],
      min: 0,
    },

    // El campo 'precioDeOferta' se elimina. La lógica de ofertas ahora es externa.

    // Galería de imágenes para el combo.
    imagenes: [
      {
        type: String,
        required: true,
      },
    ],

    // Permite al vendedor ocultar el combo de la tienda sin eliminarlo.
    publicado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// NOTA IMPORTANTE:
// La lógica para calcular el stock disponible y aplicar los precios de oferta
// ahora debe residir en tu API.
//
// Al consultar un combo, tu API debería:
// 1. Calcular el stock disponible basándose en el stock de los productos individuales.
// 2. Buscar en la colección de 'Ofertas' si alguna promoción activa aplica a este combo
//    (ya sea por su ID, su categoría, etc.).
// 3. Si encuentra una oferta, calcular el precio final y enviarlo al frontend.

export default models.Combos || model("Combos", combosSchema);
