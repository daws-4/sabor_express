"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Select,
  SelectItem,
  addToast,
  Link,
  CardFooter,
  Divider,
} from "@heroui/react";
import axios from "axios";

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
type DatosPagoMovil = {
  cedula_rif: number | string;
  telefono: number | string;
  banco: string;
};
type DatosBancolombia = {
  nequi?: number | string | null;
  numero_cuenta?: number | string | null;
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
  _id?: string;
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
  activo: boolean;
};
type UsuarioVendedorStored = {
  _id: string;
  email: string;
  nombre: string;
  estado: string;
  direccion: string;
  telefono1: string;
  telefono2: string;
  datosPagoMovil: { cedula_rif: string; telefono: number; banco: string };
  datosBancolombia: {
    nequi: number | null;
    numero_cuenta: number | null;
    tipo_cuenta: string;
  };
  datosZelle: string;
  datosPropietario: DatosPropietario;
  pagos: any[];
  activo: boolean;
  createdAt: string;
};
type UsuarioFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UsuarioVendedorForm) => void;
  usuario: UsuarioVendedorForm | null;
  isEditMode: boolean;
};

// --- Componente del Formulario ---
const UsuarioFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isEditMode,
}: UsuarioFormModalProps) => {
  const [formData, setFormData] = useState<UsuarioVendedorForm>({
    email: "",
    nombre: "",
    estado: "",
    direccion: "",
    telefono1: "",
    activo: true,
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
  });

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (isOpen) {
      const initialState =
        isEditMode && usuario
          ? {
              ...usuario,
              datosBancolombia: usuario.datosBancolombia || {
                nequi: "",
                numero_cuenta: "",
                tipo_cuenta: "",
              },
              datosPropietario: usuario.datosPropietario || {
                nombre: "",
                apellido: "",
                cedula: "",
                telefono: "",
                email: "",
                direccion: "",
              },
            }
          : {
              email: "",
              nombre: "",
              estado: "",
              direccion: "",
              telefono1: "",
              activo: true,
              datosPagoMovil: { cedula_rif: "", telefono: "", banco: "" },
              datosBancolombia: {
                nequi: "",
                numero_cuenta: "",
                tipo_cuenta: "",
              },
              datosZelle: "",
              datosPropietario: {
                nombre: "",
                apellido: "",
                cedula: "",
                telefono: "",
                email: "",
                direccion: "",
              },
            };

      setFormData(initialState);
    }
  }, [isOpen, isEditMode, usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const valueToUpdate = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newFormData = { ...prev };

      if (name.includes(".")) {
        const parts = name.split(".");
        const parentKey = parts[0];

        if (
          parentKey === "datosPagoMovil" ||
          parentKey === "datosBancolombia" ||
          parentKey === "datosPropietario"
        ) {
          const childKey = parts[1];
          const nestedObject = { ...newFormData[parentKey] };

          (nestedObject as any)[childKey] = valueToUpdate;
          (newFormData as any)[parentKey] = nestedObject;
        }
      } else {
        (newFormData as any)[name] = valueToUpdate;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? "Editar Vendedor" : "Añadir Nuevo Vendedor"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset className="p-4 border rounded-lg border-gray-300">
            <legend className="font-semibold px-2">Datos del Negocio</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                required
                className="w-full"
                name="nombre"
                placeholder="Nombre del Negocio"
                value={formData.nombre}
                onChange={handleChange}
              />
              <Select
                isRequired
                className="w-full"
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
                className="w-full md:col-span-2"
                name="email"
                placeholder="Email de Acceso"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                className="w-full md:col-span-2"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                minLength={6}
                name="password"
                placeholder={
                  isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña"
                }
                required={!isEditMode}
                type={isVisible ? "text" : "password"}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full md:col-span-2"
                name="direccion"
                placeholder="Dirección del Negocio"
                value={formData.direccion}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full"
                name="telefono1"
                placeholder="Teléfono Principal"
                value={formData.telefono1}
                onChange={handleChange}
              />
              <Input
                className="w-full"
                name="telefono2"
                placeholder="Teléfono Secundario (Opcional)"
                value={formData.telefono2 || ""}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">
              Datos del Propietario
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                required
                className="w-full"
                name="datosPropietario.nombre"
                placeholder="Nombre del Propietario"
                value={formData.datosPropietario.nombre}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full"
                name="datosPropietario.apellido"
                placeholder="Apellido"
                value={formData.datosPropietario.apellido}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full"
                minLength={6}
                name="datosPropietario.cedula"
                placeholder="Cédula"
                value={formData.datosPropietario.cedula}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full"
                name="datosPropietario.telefono"
                placeholder="Teléfono"
                value={formData.datosPropietario.telefono}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full md:col-span-2"
                name="datosPropietario.email"
                placeholder="Email"
                value={formData.datosPropietario.email}
                onChange={handleChange}
              />
              <Input
                required
                className="w-full md:col-span-2"
                name="datosPropietario.direccion"
                placeholder="Dirección"
                value={formData.datosPropietario.direccion}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">Métodos de Pago</legend>
            <h3 className="font-medium mb-2 text-sm text-gray-600">
              Pago Móvil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                required
                minLength={6}
                name="datosPagoMovil.cedula_rif"
                placeholder="Cédula/RIF"
                value={String(formData.datosPagoMovil.cedula_rif ?? "")}
                onChange={handleChange}
              />
              <Input
                required
                name="datosPagoMovil.telefono"
                placeholder="Teléfono"
                value={String(formData.datosPagoMovil.telefono ?? "")}
                onChange={handleChange}
              />
              <Select
                isRequired
                className="w-full"
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
                name="datosBancolombia.nequi"
                placeholder="Nequi"
                value={String(formData.datosBancolombia?.nequi ?? "")}
                onChange={handleChange}
              />
              <Input
                name="datosBancolombia.numero_cuenta"
                placeholder="Cuenta Bancolombia"
                value={String(formData.datosBancolombia?.numero_cuenta ?? "")}
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
                name="datosZelle"
                placeholder="Email Zelle"
                value={formData.datosZelle || ""}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              isSelected={formData.activo}
              onValueChange={(v) => setFormData((p) => ({ ...p, activo: v }))}
            />
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="activo"
            >
              Usuario Activo
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button className="bg-gray-200" type="button" onPress={onClose}>
              Cancelar
            </Button>
            <Button className="bg-[#007D8A] text-white" type="submit">
              {isEditMode ? "Guardar Cambios" : "Añadir Vendedor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
export default function GestionVendedoresPage() {
  const [admin, setAdmin] = useState<{ rol: number; estado: string } | null>(
    null,
  );
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioVendedorStored[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioVendedorForm | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const authResponse = await axios.get("/api/admin/auth-status");

        if (authResponse.data.success) {
          const currentAdmin = authResponse.data.data;

          setAdmin(currentAdmin);
          if (currentAdmin.rol < 5) {
            setFiltroEstado(currentAdmin.estado);
          }
        }
      } catch (error) {
        addToast({
          title: "Error de Sesión",
          description: "No se pudo verificar su sesión.",
          color: "danger",
        });
      } finally {
        setIsAdminLoading(false);
      }
      fetchUsuarios();
    };

    fetchInitialData();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "/api/admin/dashboard/usuarios/vendedores",
      );

      if (response.data.success) {
        setUsuarios(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setUsuarios([]);
      } else {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los vendedores.",
          color: "danger",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const estadosDisponibles = useMemo(() => {
    if (admin && admin.rol < 5) {
      return [admin.estado];
    }

    return ["Todos", ...new Set(usuarios.map((u) => u.estado))].sort();
  }, [usuarios, admin]);

  const usuariosFiltrados = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          (filtroEstado === "Todos" || u.estado === filtroEstado) &&
          (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [usuarios, searchTerm, filtroEstado],
  );

  const handleAñadir = () => {
    setIsEditMode(false);
    setUsuarioSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditar = (usuario: UsuarioVendedorStored) => {
    setIsEditMode(true);
    const { pagos, ...editableUsuario } = usuario;

    setUsuarioSeleccionado(editableUsuario);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar a este usuario?")
    ) {
      try {
        await axios.delete(`/api/admin/dashboard/usuarios/vendedores?id=${id}`);
        addToast({
          title: "Éxito",
          description: "Vendedor eliminado correctamente.",
        });
        fetchUsuarios();
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo eliminar el vendedor.",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: UsuarioVendedorForm) => {
    const parseValue = (value: any): number | null => {
      if (value === null || value === "" || value === undefined) return null;
      const num = parseInt(String(value), 10);

      return isNaN(num) ? null : num;
    };

    const processedData = {
      ...formData,
      telefono2: formData.telefono2 || "",
      datosZelle: formData.datosZelle || "",
      datosPropietario: { ...formData.datosPropietario },
      datosPagoMovil: {
        banco: formData.datosPagoMovil.banco || "",
        cedula_rif: String(formData.datosPagoMovil.cedula_rif),
        telefono: parseValue(formData.datosPagoMovil.telefono)!,
      },
      datosBancolombia: {
        tipo_cuenta: formData.datosBancolombia?.tipo_cuenta || "",
        nequi: parseValue(formData.datosBancolombia?.nequi),
        numero_cuenta: parseValue(formData.datosBancolombia?.numero_cuenta),
      },
    };

    if (!processedData.password) {
      delete processedData.password;
    }

    try {
      if (isEditMode && processedData._id) {
        await axios.put(
          `/api/admin/dashboard/usuarios/vendedores?id=${processedData._id}`,
          processedData,
        );
        addToast({
          title: "Éxito",
          description: "Vendedor actualizado correctamente.",
        });
      } else {
        await axios.post(
          "/api/admin/dashboard/usuarios/vendedores",
          processedData,
        );
        addToast({
          title: "Éxito",
          description: "Vendedor creado correctamente.",
        });
      }
      fetchUsuarios();
      setIsModalOpen(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo guardar el vendedor.",
        color: "danger",
      });
    }
  };

  if (isLoading || isAdminLoading) {
    return <div className="p-6 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <>
      <UsuarioFormModal
        isEditMode={isEditMode}
        isOpen={isModalOpen}
        usuario={usuarioSeleccionado}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <div className="p-4 md:p-6 space-y-6 bg-white min-h-screen text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Vendedores</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Input
              className="w-full sm:w-auto"
              placeholder="Buscar por nombre o email..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 rounded-lg border border-gray-300 bg-white w-full sm:w-auto"
              disabled={admin !== null && admin.rol < 5}
              title={
                admin && admin.rol < 5
                  ? `Solo tienes acceso a la región de ${admin.estado}`
                  : "Selecciona una región"
              }
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <Button
              className="bg-[#007D8A] text-white font-semibold whitespace-nowrap"
              onPress={handleAñadir}
            >
              Añadir Vendedor
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario) => (
            <Card
              key={usuario._id}
              className="border border-gray-400 rounded-xl shadow-sm flex flex-col"
            >
              <CardBody className="p-4 space-y-2 flex-grow">
                <div className="flex justify-between items-start">
                  <Link
                    key={usuario._id}
                    href={`/admin/dashboard/usuarios/vendedores/${usuario._id}`}
                  >
                    <h2 className="text-lg font-bold hover:underline">
                      {usuario.nombre}
                    </h2>
                  </Link>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${usuario.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {usuario.estado}
                </p>
                <p className="text-sm text-gray-600">{usuario.email}</p>
                <p className="text-sm text-gray-500">{usuario.telefono1}</p>
              </CardBody>
              <Divider />
              <CardFooter className="p-4  flex justify-end gap-2">
                <Button
                  className="text-sm bg-orange-500 text-white"
                  onPress={() => handleEditar(usuario)}
                >
                  Editar
                </Button>
                <Button
                  className="text-sm bg-red-600 text-white"
                  onPress={() => handleEliminar(usuario._id)}
                >
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {usuariosFiltrados.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron vendedores.</p>
          </div>
        )}
      </div>
    </>
  );
}
