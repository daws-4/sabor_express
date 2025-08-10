import { Schema, model, models } from "mongoose";

// Sub-esquema para la información del vehículo del repartidor
const VehiculoSchema = new Schema({
  tipo: {
    type: String,
    enum: ["Moto", "Bicicleta", "Carro", "Otro"],
    required: [true, "El tipo de vehículo es obligatorio."],
  },
  marca: {
    type: String,
    trim: true,
  },
  modelo: {
    type: String,
    trim: true,
  },
  placa: {
    type: String,
    trim: true,
    unique: true,
    // La placa solo es obligatoria si el vehículo no es una bicicleta
    required: function () {
      return this.tipo !== "Bicicleta";
    },
  },
  color: {
    type: String,
    trim: true,
  },
});

const usuariosDeliverySchema = new Schema(
  {
    // --- Información Personal ---
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, "El apellido es obligatorio."],
      trim: true,
    },
    cedula: {
      type: String,
      required: [true, "La cédula es obligatoria."],
      unique: true,
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria."],
      select: false, // No se devolverá en las consultas por defecto
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
    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria."],
      trim: true,
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, "La fecha de nacimiento es obligatoria."],
    },

    // --- Información del Vehículo ---
    vehiculo: {
      type: VehiculoSchema,
      required: true,
    },

    // --- Estado y Ubicación Operativa ---
    estado_operativo: {
      type: String,
      enum: ["Activo", "Inactivo", "En-Ruta", "Descansando"],
      default: "Inactivo",
    },
    ubicacion_actual: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitud, latitud]
        default: [0, 0],
      },
    },

    // --- Estatus Administrativo y Calificaciones ---
    activo: {
      type: Boolean,
      default: false, // El administrador debe activar la cuenta
    },
    calificacion_promedio: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    // --- Historial de Entregas ---
    historial_entregas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pedido", // Referencia a otro modelo, por ejemplo 'Pedido' o 'Entrega'
      },
    ],
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  },
);

// Índice geoespacial para consultas de ubicación
usuariosDeliverySchema.index({ ubicacion_actual: "2dsphere" });

export default models.UsuariosDelivery ||
  model("UsuariosDelivery", usuariosDeliverySchema);
