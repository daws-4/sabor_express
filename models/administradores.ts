import { Schema, model, models } from "mongoose";

const administradoresSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      trim: true,
    },
    rol: {
      type: Number,
      default: 1,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    telefono: {
      type: String,
      required: [true, "El número de teléfono es obligatorio"],
      trim: true,
    },
    estado: {
      type: String,
      required: true,
      enum: [
        "Amazonas",
        "Anzoátegui",
        "Apure",
        "Aragua",
        "Barinas",
        "Bolívar",
        "Carabobo",
        "Cojedes",
        "Delta Amacuro",
        "Falcón",
        "Guárico",
        "Lara",
        "Mérida",
        "Miranda",
        "Monagas",
        "Nueva Esparta",
        "Portuguesa",
        "Sucre",
        "Táchira",
        "Trujillo",
        "Vargas",
        "Yaracuy",
        "Zulia",
        "Distrito Capital",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default models.administradores ||
  model("administradores", administradoresSchema);
