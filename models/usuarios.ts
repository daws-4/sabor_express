import { Schema, model, models } from "mongoose";

const usuariosSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "Por favor, ingrese su nombre"],
      trim: true,
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },
    apellido: {
      type: String,
      required: [true, "Por favor, ingrese su apellido"],
      trim: true,
      maxlength: [50, "El apellido no puede tener más de 50 caracteres"],
    },
    cedula: {
      type: String,
      required: [true, "Por favor, ingrese su número de cédula"],
      trim: true,
      unique: true,
      maxlength: [
        20,
        "El número de cédula no puede tener más de 20 caracteres",
      ],
    },
    telefono: {
      type: String,
      required: [true, "Por favor, ingrese su número de teléfono"],
      trim: true,
      maxlength: [
        20,
        "El número de teléfono no puede tener más de 20 caracteres",
      ],
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, "Por favor, ingrese su fecha de nacimiento"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default models.Usuarios || model("Usuarios", usuariosSchema);
