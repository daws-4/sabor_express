import { Schema, model, models } from "mongoose";

// --- Sub-esquemas existentes (sin cambios) ---
export const PagosSchema = new Schema({
  mes: {
    type: String,
    required: true,
  },
  fecha_de_facturacion: {
    type: Date,
    required: true,
  },
  monto_a_pagar: {
    type: Number,
    required: true,
  },
  fecha_de_cancelacion: {
    type: Date,
    required: true,
  },
  divisa_cancelada: {
    type: String,
    enum: ["USD", "VES", "COP", "EUR"],
    default: "USD",
    required: true,
  },
  monto_cancelado: {
    type: Number,
    required: true,
  },
  tasa_de_cambio: {
    type: Number,
    required: true,
  },
});

export const DatosBancolombiaSchema = new Schema({
  nequi: {
    type: String,
  },
  numero_cuenta: {
    type: String,
  },
  tipo_cuenta: {
    type: String,
    enum: ["Ahorros", "Corriente", ""],
    default: "",
  },
});

export const DatosPagoMovilSchema = new Schema({
  cedula_rif: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  banco: {
    type: String,
    enum: [
      "Banco de Venezuela",
      "Banesco",
      "Banco Mercantil",
      "BBVA Provincial",
      "Banco Nacional de Crédito",
      "Banco del Tesoro",
      "Banco Occidental de Descuento",
      "Bancamiga",
      "Banco Venezolano de Crédito",
      "Banco Exterior",
      "Banco Bicentenario",
      "Banco Activo",
      "Bancaribe",
      "Banplus",
      "Banco Fondo Común",
      "Banco Caroní",
      "Banco Plaza",
    ],
    required: true,
  },
});

const DatosPropietarioSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true },
  telefono: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
  },
  direccion: { type: String, required: true },
});

const RedesSocialesSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      enum: ["Instagram", "Facebook", "TikTok", "X", "Otro"],
    },
    enlace: {
      type: String,
      trim: true,
    },
    usuario: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

// --- SUB-ESQUEMA DE UBICACIÓN ACTUALIZADO ---
const UbicacionGoogleSchema = new Schema(
  {
    placeId: { type: String, trim: true },
    nombre: { type: String, trim: true }, // Nuevo: para placeName
    direccionFormateada: { type: String, trim: true }, // Nuevo: para placeAddress
    enlace: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false },
);

const HorarioSchema = new Schema(
  {
    dia: {
      type: String,
      required: true,
      enum: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
    },
    abre: { type: String, trim: true },
    cierra: { type: String, trim: true },
    abierto: { type: Boolean, default: false },
  },
  { _id: false },
);

const usuariosVendedoresSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    direccion: {
      type: String,
      required: true,
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
    },
    telefono1: {
      type: String,
      required: true,
      trim: true,
    },
    telefono2: {
      type: String,
      trim: true,
    },
    datosPagoMovil: DatosPagoMovilSchema,
    datosBancolombia: DatosBancolombiaSchema,
    datosZelle: {
      type: String,
    },
    datosPropietario: DatosPropietarioSchema,
    redes_sociales: [RedesSocialesSchema],
    pagos: [PagosSchema],
    activo: {
      type: Boolean,
      default: false,
    },
    aceptaTerminos: {
      type: Boolean,
      required: true,
      default: false,
    },
    ubicacionGoogle: UbicacionGoogleSchema,
    imagenes: [{ type: String }],
    horario: [HorarioSchema],
  },
  {
    timestamps: true,
  },
);

export default models.UsuariosVendedores ||
  model("UsuariosVendedores", usuariosVendedoresSchema);
