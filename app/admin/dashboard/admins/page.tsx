"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import axios from "axios";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons"; // Asume que tienes estos iconos

// --- Constantes ---
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

// --- Tipos de Datos ---
type AdminForm = {
  _id?: string;
  username: string;
  email: string;
  telefono: string;
  password?: string;
  rol: number | string;
  estado: string;
};

type AdminStored = {
  _id: string;
  username: string;
  email: string;
  telefono: string;
  rol: number;
  estado: string;
  createdAt: string;
};

type AdminFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AdminForm) => void;
  usuario: AdminForm | null;
  isEditMode: boolean;
};

// --- Componente del Formulario Modal ---
const AdminFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isEditMode,
}: AdminFormModalProps) => {
  const [formData, setFormData] = useState<AdminForm>({
    username: "",
    email: "",
    telefono: "",
    rol: 1,
    estado: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (isOpen) {
      const initialState =
        isEditMode && usuario
          ? usuario
          : {
              username: "",
              email: "",
              telefono: "",
              rol: 1,
              estado: "",
              password: "",
            };

      setFormData(initialState);
    }
  }, [isOpen, isEditMode, usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, estado: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {isEditMode ? "Editar Administrador" : "Añadir Nuevo Administrador"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            required
            label="Nombre de Usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <Input
            required
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            required
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
          <Input
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
            minLength={6}
            name="password"
            placeholder={isEditMode ? "Dejar en blanco para no cambiar" : ""}
            required={!isEditMode}
            type={isVisible ? "text" : "password"}
            onChange={handleChange}
          />
          <Input
            required
            label="Rol (ej. 1 para regional, 5 para superadmin)"
            max="5"
            min="1"
            name="rol"
            type="number"
            value={String(formData.rol)}
            onChange={handleChange}
          />
          <Select
            isRequired
            label="Estado Asignado"
            placeholder="Selecciona un estado"
            selectedKeys={[formData.estado]}
            onSelectionChange={(keys) =>
              handleSelectChange(Array.from(keys)[0] as string)
            }
          >
            {estadosDeVenezuela.map((e) => (
              <SelectItem key={e.key}>{e.label}</SelectItem>
            ))}
          </Select>
          <div className="flex justify-end gap-4 mt-6">
            <Button className="bg-gray-200" type="button" onPress={onClose}>
              Cancelar
            </Button>
            <Button className="bg-[#007D8A] text-white" type="submit">
              {isEditMode ? "Guardar Cambios" : "Añadir Administrador"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
export default function GestionAdminPage() {
  const [admins, setAdmins] = useState<AdminStored[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<AdminForm | null>(null);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/admin/dashboard/admins");

      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAdmins([]);
      } else {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los administradores.",
          color: "danger",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const adminsFiltrados = useMemo(
    () =>
      admins.filter(
        (u) =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [admins, searchTerm],
  );

  const handleAñadir = () => {
    setIsEditMode(false);
    setUsuarioSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditar = (usuario: AdminStored) => {
    setIsEditMode(true);
    setUsuarioSeleccionado(usuario);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar a este administrador?",
      )
    ) {
      try {
        await axios.delete(`/api/admin/dashboard/admins?id=${id}`);
        addToast({
          title: "Éxito",
          description: "Administrador eliminado correctamente.",
        });
        fetchAdmins();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.error ||
          "No se pudo eliminar el administrador.";

        addToast({ title: "Error", description: errorMsg, color: "danger" });
      }
    }
  };

  const handleFormSubmit = async (formData: AdminForm) => {
    try {
      if (isEditMode && formData._id) {
        await axios.put(
          `/api/admin/dashboard/admins?id=${formData._id}`,
          formData,
        );
        addToast({
          title: "Éxito",
          description: "Administrador actualizado correctamente.",
        });
      } else {
        await axios.post("/api/admin/dashboard/admins", formData);
        addToast({
          title: "Éxito",
          description: "Administrador creado correctamente.",
        });
      }
      fetchAdmins();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "No se pudo guardar el administrador.";

      addToast({ title: "Error", description: errorMsg, color: "danger" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando administradores...
      </div>
    );
  }

  return (
    <>
      <AdminFormModal
        isEditMode={isEditMode}
        isOpen={isModalOpen}
        usuario={usuarioSeleccionado}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <div className="p-4 md:p-6 space-y-6 bg-white min-h-screen text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Administradores</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              className="w-full md:w-64"
              placeholder="Buscar por usuario o email..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="bg-[#007D8A] text-white font-semibold whitespace-nowrap"
              onPress={handleAñadir}
            >
              Añadir Admin
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminsFiltrados.map((usuario) => (
            <Card
              key={usuario._id}
              className="border rounded-xl border-gray-300 shadow-sm"
            >
              <CardBody className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold">{usuario.username}</h2>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Rol: {usuario.rol}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {usuario.estado}
                </p>
                <p className="text-sm text-gray-600">{usuario.email}</p>
                <div className="pt-2 flex justify-end gap-2">
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
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        {adminsFiltrados.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron administradores.</p>
          </div>
        )}
      </div>
    </>
  );
}
