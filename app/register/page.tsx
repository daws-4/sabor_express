"use client";

import React, { useState } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  addToast,
  Card,
  CardBody,
  Checkbox,
  Link,
} from "@heroui/react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons"; // Asume que tienes estos iconos

// --- Constantes para los Selectores ---
const estadosDeVenezuela = [
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
].map((estado) => ({ key: estado, label: estado }));

const bancosDeVenezuela = [
  "Banco de Venezuela",
  "Banesco",
  "Banco Mercantil",
  "BBVA Provincial",
  "Banco Nacional de Crédito (BNC)",
  "Banco del Tesoro",
  "BOD (Banco Occidental de Descuento)",
  "Bancamiga",
  "Banco Venezolano de Crédito",
  "Banco Exterior",
  "Banco Bicentenario",
  "Banco Activo",
  "Bancaribe",
  "Banplus",
  "Banco Fondo Común (BFC)",
  "Banco Caroní",
  "Banco Plaza",
].map((banco) => ({ key: banco, label: banco }));

const tiposDeCuenta = [
  { key: "Ahorros", label: "Ahorros" },
  { key: "Corriente", label: "Corriente" },
];

// --- Tipos de Datos ---
type DatosPagoMovil = { cedula_rif: string; telefono: string; banco: string };
type DatosBancolombia = {
  nequi?: string;
  numero_cuenta?: string;
  tipo_cuenta?: string;
};
type DatosPropietario = {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
};
type UsuarioVendedorForm = {
  email: string;
  password?: string;
  nombre: string;
  estado: string;
  direccion: string;
  telefono1: string;
  telefono2?: string;
  datosPagoMovil: DatosPagoMovil;
  datosBancolombia?: DatosBancolombia;
  datosZelle?: string;
  datosPropietario: DatosPropietario;
  aceptaTerminos: boolean;
};
type TerminosModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
};

// --- Componente del Modal de Términos y Condiciones ---
const TerminosModal = ({ isOpen, onAccept }: TerminosModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full mx-auto shadow-lg max-h-[90vh] flex flex-col">
        <CardBody className="p-6 md:p-8 text-gray-700 overflow-y-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Términos y Condiciones de Servicio
            </h1>
            <p className="text-gray-500 mt-2">
              Última actualización: 19 de Julio de 2025
            </p>
          </header>

          <div className="space-y-6 text-base leading-relaxed">
            <p>
              Bienvenido a <strong>Miche Claro</strong>. Antes de utilizar
              nuestros servicios, te pedimos que leas detenidamente los
              siguientes términos y condiciones. Al registrarte o utilizar
              nuestra plataforma, confirmas que has leído, entendido y aceptado
              estar sujeto a estos términos.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                1. Descripción del Servicio
              </h2>
              <p>
                <strong>Miche Claro</strong>{" "}
                {
                  'es una plataforma online que actúa como intermediario para conectar a vendedores de mercancía ("Vendedores") con clientes ("Consumidores"). Nuestro servicio está enfocado principalmente en la comercialización de productos de consumo, incluyendo, pero no limitándose a,'
                }{" "}
                <strong>bebidas alcohólicas</strong> y productos relacionados.
                La plataforma permite a los Vendedores gestionar su catálogo de
                productos y recibir pedidos online para optimizar y digitalizar
                su negocio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                2. Proceso de Registro y Cuota de Afiliación
              </h2>
              <p>
                Para registrarse como Vendedor en nuestra plataforma, es
                necesario completar un proceso de verificación. Este proceso
                conlleva una{" "}
                <strong>
                  cuota única de afiliación de cincuenta dólares estadounidenses
                  ($50.00 USD)
                </strong>
                .
              </p>
              <ul className="list-disc list-inside mt-2 pl-4 space-y-1">
                <li>
                  Esta cuota cubre los costos administrativos y de verificación
                  inicial.
                </li>
                <li>
                  El pago de la cuota no garantiza la aprobación. Todos los
                  perfiles están sujetos a un proceso de revisión.
                </li>
                <li>
                  Una vez enviada tu solicitud de registro, nuestro equipo
                  técnico se pondrá en contacto contigo para guiarte en el
                  proceso de pago y los siguientes pasos para la activación de
                  tu cuenta.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                3. Transacciones Financieras
              </h2>
              <p className="font-bold text-red-600">
                Miche Claro NO procesa, gestiona ni interviene en las
                transacciones financieras directas entre Vendedores y
                Consumidores.
              </p>
              <p className="mt-2">
                Nuestra plataforma facilita la comunicación y la gestión de
                pedidos, pero no actúa como una pasarela de pago para las
                transacciones de productos. La responsabilidad de cobrar y
                procesar los pagos recae exclusivamente en el Vendedor. Miche
                Claro no se hace responsable de disputas, fraudes o cualquier
                otro problema relacionado con los pagos entre las partes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                4. Funcionalidades Adicionales: Juegos
              </h2>
              <p>
                Además de los servicios de venta online, la aplicación incluye
                un apartado de juegos y entretenimiento. El propósito de estas
                funcionalidades es mejorar la experiencia del usuario y atraer a
                una mayor comunidad a la plataforma, beneficiando así la
                visibilidad de los Vendedores registrados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                5. Contacto y Soporte
              </h2>
              <p>
                Si tienes alguna pregunta sobre el proceso de registro, el pago
                de la cuota de afiliación o cualquier otro aspecto de nuestros
                servicios, no dudes en contactar a nuestro equipo técnico.
              </p>
              <div className="mt-2">
                <p>
                  <strong>Correo Electrónico:</strong>{" "}
                  <Link
                    className="text-blue-600 hover:underline"
                    href="mailto:soporte@micheclaro.com"
                  >
                    soporte@micheclaro.com
                  </Link>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{" "}
                  <Link
                    className="text-blue-600 hover:underline"
                    href="https://wa.me/1234567890"
                    target="_blank"
                  >
                    +1 (234) 567-890
                  </Link>
                </p>
              </div>
            </section>

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="font-semibold">
                {
                  ' Al hacer clic en "Aceptar y Volver al Registro" o al continuar utilizando nuestros servicios, confirmas tu total aceptación de estos Términos y Condiciones.'
                }
              </p>
            </div>
          </div>
        </CardBody>
        <footer className="p-4 border-t bg-gray-50 text-center">
          <Button
            className="bg-[#007D8A] text-white w-full sm:w-auto"
            onPress={onAccept}
          >
            He Leído y Acepto los Términos
          </Button>
        </footer>
      </Card>
    </div>
  );
};

// --- Componente Principal de la Página de Registro ---
export default function RegistroVendedorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UsuarioVendedorForm>({
    email: "",
    password: "",
    nombre: "",
    estado: "",
    direccion: "",
    telefono1: "",
    telefono2: "",
    datosPagoMovil: { cedula_rif: "", telefono: "", banco: "" },
    datosBancolombia: { nequi: "", numero_cuenta: "", tipo_cuenta: "" },
    datosZelle: "",
    datosPropietario: {
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      email: "",
      direccion: "",
    },
    aceptaTerminos: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = { ...prev };

      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");

        if (
          parentKey === "datosPagoMovil" ||
          parentKey === "datosBancolombia" ||
          parentKey === "datosPropietario"
        ) {
          const nestedObject = { ...newFormData[parentKey] };

          (nestedObject as any)[childKey] = value;
          (newFormData as any)[parentKey] = nestedObject;
        }
      } else {
        (newFormData as any)[name] = value;
      }

      return newFormData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "estado") {
      setFormData((prev) => ({ ...prev, estado: value }));
    } else if (name === "banco") {
      setFormData((prev) => ({
        ...prev,
        datosPagoMovil: { ...prev.datosPagoMovil, banco: value },
      }));
    } else if (name === "tipo_cuenta") {
      setFormData((prev) => ({
        ...prev,
        datosBancolombia: { ...prev.datosBancolombia, tipo_cuenta: value },
      }));
    }
  };

  const handleAcceptTerms = () => {
    setFormData((prev) => ({ ...prev, aceptaTerminos: true }));
    setIsTermsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) {
      addToast({
        title: "Atención",
        description: "Debe aceptar los términos y condiciones para continuar.",
        color: "warning",
      });

      return;
    }
    setIsSaving(true);
    try {
      const response = await axios.post("/api/register", formData);

      if (response.data.success) {
        addToast({
          title: "¡Solicitud Enviada!",
          description: response.data.message,
          color: "success",
        });
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error en el registro:", error);
      const errorMsg =
        error.response?.data?.error || "No se pudo completar el registro.";

      addToast({
        title: "Error de Registro",
        description: errorMsg,
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TerminosModal
        isOpen={isTermsModalOpen}
        onAccept={handleAcceptTerms}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Conviértete en Vendedor
            </h1>
            <p className="mt-2 text-gray-600">
              Completa el formulario para iniciar tu proceso de afiliación.
            </p>
          </div>

          <div
            className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md"
            role="alert"
          >
            <p className="font-bold">Proceso de Registro y Afiliación</p>
            <p className="mt-2 text-sm">
              Para completar tu registro y activar tu cuenta como vendedor, se
              requiere una <strong>cuota única de afiliación de $50</strong>.
              Una vez que envíes este formulario, nuestro equipo técnico
              revisará tus datos y se pondrá en contacto contigo.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="p-4 border rounded-lg border-gray-300">
              <legend className="font-semibold px-2 text-gray-700">
                Datos del Negocio
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label="Nombre del Negocio"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                <Select
                  isRequired
                  label="Estado"
                  placeholder="Selecciona un estado"
                  selectedKeys={formData.estado ? [formData.estado] : []}
                  onSelectionChange={(keys) =>
                    handleSelectChange("estado", Array.from(keys)[0] as string)
                  }
                >
                  {estadosDeVenezuela.map((estado) => (
                    <SelectItem key={estado.key}>{estado.label}</SelectItem>
                  ))}
                </Select>
                <Input
                  required
                  className="md:col-span-2"
                  label="Email de Acceso"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  required
                  className="md:col-span-2"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
                    </button>
                  }
                  label="Contraseña"
                  name="password"
                  type={isVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <Input
                  required
                  className="md:col-span-2"
                  label="Dirección del Negocio"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Teléfono Principal"
                  name="telefono1"
                  value={formData.telefono1}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono Secundario (Opcional)"
                  name="telefono2"
                  value={formData.telefono2 || ""}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            <fieldset className="p-4 border rounded-lg border-gray-300">
              <legend className="font-semibold px-2 text-gray-700">
                Datos del Propietario
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label="Nombre del Propietario"
                  name="datosPropietario.nombre"
                  value={formData.datosPropietario.nombre}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Apellido"
                  name="datosPropietario.apellido"
                  value={formData.datosPropietario.apellido}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Cédula"
                  name="datosPropietario.cedula"
                  value={formData.datosPropietario.cedula}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Teléfono"
                  name="datosPropietario.telefono"
                  value={formData.datosPropietario.telefono}
                  onChange={handleChange}
                />
                <Input
                  required
                  className="md:col-span-2"
                  label="Email"
                  name="datosPropietario.email"
                  value={formData.datosPropietario.email}
                  onChange={handleChange}
                />
                <Input
                  required
                  className="md:col-span-2"
                  label="Dirección"
                  name="datosPropietario.direccion"
                  value={formData.datosPropietario.direccion}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            <fieldset className="p-4 border rounded-lg border-gray-300">
              <legend className="font-semibold px-2 text-gray-700">
                Métodos de Pago (para recibir tus ganancias)
              </legend>
              <h3 className="font-medium mb-2 text-sm text-gray-600">
                Pago Móvil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  required
                  label="Cédula/RIF"
                  name="datosPagoMovil.cedula_rif"
                  value={formData.datosPagoMovil.cedula_rif}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Teléfono"
                  name="datosPagoMovil.telefono"
                  value={formData.datosPagoMovil.telefono}
                  onChange={handleChange}
                />
                <Select
                  isRequired
                  label="Banco"
                  placeholder="Selecciona un banco"
                  selectedKeys={
                    formData.datosPagoMovil.banco
                      ? [formData.datosPagoMovil.banco]
                      : []
                  }
                  onSelectionChange={(keys) =>
                    handleSelectChange("banco", Array.from(keys)[0] as string)
                  }
                >
                  {bancosDeVenezuela.map((banco) => (
                    <SelectItem key={banco.key}>{banco.label}</SelectItem>
                  ))}
                </Select>
              </div>
              <h3 className="font-medium mb-2 text-sm text-gray-600">
                Otros (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nequi"
                  name="datosBancolombia.nequi"
                  value={formData.datosBancolombia?.nequi || ""}
                  onChange={handleChange}
                />
                <Input
                  label="Cuenta Bancolombia"
                  name="datosBancolombia.numero_cuenta"
                  value={formData.datosBancolombia?.numero_cuenta || ""}
                  onChange={handleChange}
                />
                <Select
                  className="w-full"
                  label="Tipo de Cuenta"
                  placeholder="Selecciona"
                  selectedKeys={
                    formData.datosBancolombia?.tipo_cuenta
                      ? [formData.datosBancolombia.tipo_cuenta]
                      : []
                  }
                  onSelectionChange={(keys) =>
                    handleSelectChange(
                      "tipo_cuenta",
                      Array.from(keys)[0] as string,
                    )
                  }
                >
                  {tiposDeCuenta.map((cuenta) => (
                    <SelectItem key={cuenta.key}>{cuenta.label}</SelectItem>
                  ))}
                </Select>
                <Input
                  className="md:col-span-2"
                  label="Email Zelle"
                  name="datosZelle"
                  value={formData.datosZelle || ""}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="aceptaTerminos"
                isSelected={formData.aceptaTerminos}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, aceptaTerminos: v }))
                }
              />
              <label className="text-sm text-gray-600" htmlFor="aceptaTerminos">
                He leído y acepto los{" "}
                <Button
                  className="text-blue-600 hover:underline cursor-pointer"
                  onPress={() => setIsTermsModalOpen(true)}
                >
                  Términos y Condiciones
                </Button>
                .
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                className="bg-[#007D8A] text-white w-full md:w-auto"
                isDisabled={!formData.aceptaTerminos}
                isLoading={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Enviando Solicitud..."
                  : "Enviar Solicitud de Registro"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
