"use client";

import React, { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem, addToast } from "@heroui/react";
import axios from "axios";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons"; // Asume que tienes estos iconos

// --- Constantes y Tipos ---
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

type AdminData = {
  _id: string;
  username: string;
  email: string;
  telefono: string;
  estado: string;
  rol: number;
  password?: string; // La contraseña es opcional en el formulario
};

export default function ConfiguracionPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  // --- Cargar datos del administrador ---
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/admin/dashboard/config");

        if (response.data.success) {
          setAdminData(response.data.data);
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setAdminData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (value: string) => {
    setAdminData((prev) => (prev ? { ...prev, estado: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) return;

    setIsSaving(true);
    try {
      // Prepara los datos a enviar, excluyendo el rol para que no se modifique
      const { rol, ...updateData } = adminData;

      const response = await axios.put(
        "/api/admin/dashboard/config",
        updateData,
      );

      if (response.data.success) {
        addToast({
          title: "Éxito",
          description: "Tus datos han sido actualizados.",
        });
        // Limpiar el campo de la contraseña en el frontend después de guardar
        setAdminData((prev) => (prev ? { ...prev, password: "" } : null));
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "No se pudieron guardar los cambios.";

      addToast({ title: "Error", description: errorMsg, color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando configuración...</div>;
  }

  if (!adminData) {
    return (
      <div className="p-6 text-center text-red-500">
        No se pudieron cargar los datos del administrador.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white text-black rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-6">Configuración de la Cuenta</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          isReadOnly
          className="w-full"
          description="El nombre de usuario no se puede cambiar."
          label="Nombre de Usuario"
          value={adminData.username}
        />

        <Input
          required
          className="w-full"
          label="Correo Electrónico"
          name="email"
          type="email"
          value={adminData.email}
          onChange={handleChange}
        />

        <Input
          required
          className="w-full"
          label="Número de Teléfono"
          name="telefono"
          value={adminData.telefono}
          onChange={handleChange}
        />

        <Input
          className="w-full"
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
          label="Nueva Contraseña"
          minLength={6}
          name="password"
          placeholder="Dejar en blanco para no cambiar"
          type={isVisible ? "text" : "password"}
          value={adminData.password || ""}
          onChange={handleChange}
        />

        <Select
          isRequired
          className="w-full"
          description={
            adminData.rol < 5
              ? "No tienes permisos para cambiar el estado."
              : ""
          }
          isDisabled={adminData.rol < 5} // El campo se deshabilita si el rol es menor a 5
          label="Estado"
          placeholder="Selecciona tu estado"
          selectedKeys={[adminData.estado]}
          onSelectionChange={(keys) =>
            handleSelectChange(Array.from(keys)[0] as string)
          }
        >
          {estadosDeVenezuela.map((estado) => (
            <SelectItem key={estado.key}>{estado.label}</SelectItem>
          ))}
        </Select>

        <div className="flex justify-end pt-4">
          <Button
            className="bg-[#007D8A] text-white"
            isLoading={isSaving}
            type="submit"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
