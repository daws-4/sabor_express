"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, Link } from "@heroui/react";
import { X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Menu, Config, LogOutIcon, User, AdminIcon } from "@/components/icons"; // Asumo que tienes un icono 'Shield' o similar para Admin

// Define el tipo de cada ítem de menú
type MenuItem = {
  titulo: string;
  href: string;
  Icon: React.ReactNode;
  requiredRole?: number; // Rol mínimo para ver este ítem
};

// Array base de elementos del menú
const allMenuItems: MenuItem[] = [
  {
    titulo: "Inicio",
    href: "/admin/dashboard",
    Icon: <Menu />,
  },
  {
    titulo: "Usuarios",
    href: "/admin/dashboard/usuarios",
    Icon: <User />,
  },
  {
    titulo: "Admins",
    href: "/admin/dashboard/admins",
    Icon: <AdminIcon />,
    requiredRole: 5,
  },
  {
    titulo: "Configuración",
    href: "/admin/dashboard/config",
    Icon: <Config />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ rol: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // --- Obtener datos del admin al cargar el layout ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/admin/auth-status");

        if (response.data.success) {
          setAdmin(response.data.data);
        }
      } catch (error) {
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // --- Filtrar menú basado en el rol del admin ---
  const menuItems = useMemo(() => {
    if (!admin) return []; // No mostrar ítems si no hay datos del admin

    return allMenuItems.filter((item) => {
      // Si el ítem no requiere un rol, siempre se muestra.
      if (!item.requiredRole) {
        return true;
      }

      // Si requiere un rol, se compara con el rol del admin.
      return admin.rol >= item.requiredRole;
    });
  }, [admin]);

  const LogOut = async () => {
    try {
      const response = await axios.get("/api/auth/logout");

      if (response.status === 200) {
        router.push("/admin/login"); // Redirige al login
      }
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-100">
      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between bg-[#003f63] text-white p-4">
        <h1 className="text-xl font-bold">Miche Claro</h1>
        <button
          className="bg-[#003f63]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-[#003f63] text-white w-64 p-6 flex-col space-y-6 transform sm:transform-none transition-transform duration-200 z-50 ${
          sidebarOpen
            ? "flex absolute sm:relative left-0 top-0 h-full"
            : "hidden sm:flex"
        }`}
      >
        <h1 className="text-2xl font-bold">Miche Claro</h1>
        <div className="text-lg mb-4">Menú</div>
        <nav className="flex flex-col gap-4 flex-grow">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              isPressable
              className="hover:shadow-xl"
              radius="sm"
              shadow="lg"
            >
              <Link className="block" color="foreground" href={item.href}>
                <CardBody className="flex flex-row items-center gap-3 bg-[#2096da] px-4 py-2 rounded">
                  {item.Icon}
                  <span className="font-medium text-base">{item.titulo}</span>
                </CardBody>
              </Link>
            </Card>
          ))}
          <Card
            isPressable
            className="hover:shadow-xl"
            radius="sm"
            shadow="lg"
            onPress={LogOut}
          >
            <CardBody className="flex flex-row items-center gap-3 bg-[#2096da] px-4 py-2 rounded">
              <LogOutIcon />
              <span className="font-medium text-base">Cerrar Sesión</span>
            </CardBody>
          </Card>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
