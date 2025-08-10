import { Schema, model, models } from "mongoose";

const pedidosSchema = new Schema(
  {
    id_productos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Productos",
      },
    ],
    id_combos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Combos",
      },
    ],
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
    },
    id_usuarioVendedor: {
      type: Schema.Types.ObjectId,
      ref: "UsuariosVendedores",
    },
    ubicacionG: {
      type: String, // Consider using a more specific type like GeoJSON for geospatial data
    },
    status: {
      type: String,
      enum: ["pendiente", "en_proceso", "entregado", "cancelado"], // Example statuses
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  },
);

export default models.Pedidos || model("Pedidos", pedidosSchema);
