"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardBody, addToast, Button } from "@heroui/react";
import axios from "axios";

// --- Tipos de Datos ---
type UsuarioVendedor = {
  id: string;
  nombre: string;
  ubicacion: string;
  ventas: number;
  dineroGenerado: number;
};

type UsuarioDelivery = {
  id: string;
  nombre: string;
  ubicacion: string;
  servicios: number;
  dineroGenerado: number;
};

export default function UsuariosPage() {
  // --- Estados para datos dinámicos, admin y carga ---
  const [vendedores, setVendedores] = useState<UsuarioVendedor[]>([]);
  const [deliverys, setDeliverys] = useState<UsuarioDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ rol: number; estado: string } | null>(
    null,
  );
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todas");

  // --- Cargar datos del admin y del dashboard al montar el componente ---
  useEffect(() => {
    const fetchInitialData = async () => {
      // Primero, verificar el estado de autenticación del admin
      try {
        const authResponse = await axios.get("/api/admin/auth-status");

        if (authResponse.data.success) {
          const currentAdmin = authResponse.data.data;

          setAdmin(currentAdmin);
          // Aplicar el filtro de estado basado en el rol
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

      // Luego, obtener los datos del dashboard
      try {
        const response = await axios.get("/api/admin/dashboard/usuarios");

        if (response.data.success) {
          setVendedores(response.data.data.vendedores);
          setDeliverys(response.data.data.deliverys);
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos de los usuarios.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const estadosDisponibles = useMemo(() => {
    const estadosVendedores = vendedores.map((v) => v.ubicacion);
    const estadosDeliverys = deliverys.map((d) => d.ubicacion);
    const todosLosEstados = [
      ...new Set([...estadosVendedores, ...estadosDeliverys]),
    ].sort();

    return ["Todas", ...todosLosEstados];
  }, [vendedores, deliverys]);

  const vendedoresFiltrados = useMemo(() => {
    if (filtroEstado === "Todas") return vendedores;

    return vendedores.filter((v) => v.ubicacion === filtroEstado);
  }, [filtroEstado, vendedores]);

  const deliveryFiltrados = useMemo(() => {
    if (filtroEstado === "Todas") return deliverys;

    return deliverys.filter((d) => d.ubicacion.includes(filtroEstado));
  }, [filtroEstado, deliverys]);

  const topVendedores = vendedoresFiltrados.slice(0, 10);
  const topDeliverys = deliveryFiltrados.slice(0, 10);

  if (isLoading || isAdminLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Cargando datos...</div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-black space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <label className="font-semibold mr-2" htmlFor="filtroEstado">
            Filtrar por Estado:
          </label>
          <select
            className="border border-gray-300 rounded p-2"
            disabled={admin !== null && admin.rol < 5}
            id="filtroEstado"
            title={
              admin && admin.rol < 5
                ? `Solo tienes acceso a los datos de ${admin.estado}`
                : "Selecciona un estado"
            }
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {admin && admin.rol < 5 ? (
              <option value={admin.estado}>{admin.estado}</option>
            ) : (
              estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/dashboard/usuarios/vendedores">
            <Button className="bg-[#007D8A] text-white hover:bg-[#005f62]">
              Gestionar Vendedores
            </Button>
          </Link>
          <Link href="/admin/dashboard/usuarios/delivery">
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              Gestionar Delivery
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-bold mb-4">Top 10 Vendedores</h2>
          <Card className="bg-[#007D8A] text-white max-h-[600px] overflow-y-auto">
            <CardBody>
              {topVendedores.length === 0 ? (
                <p className="text-center py-4">
                  No hay vendedores para mostrar.
                </p>
              ) : (
                topVendedores.map((user) => (
                  <Link
                    key={user.id}
                    className="block py-2 px-3 border-b border-white/20 last:border-none hover:bg-[#00686f] rounded-md transition-colors"
                    href={`/admin/dashboard/usuarios/vendedores/${user.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{user.nombre}</p>
                        <p className="text-sm opacity-80">{user.ubicacion}</p>
                      </div>
                      <div className="text-right">
                        <p>Ventas: {user.ventas}</p>
                        <p>Dinero: ${user.dineroGenerado.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Top 10 Delivery</h2>
          <Card className="bg-orange-500 text-white max-h-[600px] overflow-y-auto">
            <CardBody>
              {topDeliverys.length === 0 ? (
                <p className="text-center py-4">
                  No hay repartidores para mostrar.
                </p>
              ) : (
                topDeliverys.map((user) => (
                  <Link
                    key={user.id}
                    className="block py-2 px-3 border-b border-white/20 last:border-none hover:bg-orange-600 rounded-md transition-colors"
                    href={`/admin/dashboard/usuarios/delivery/${user.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{user.nombre}</p>
                        <p className="text-sm opacity-80">{user.ubicacion}</p>
                      </div>
                      <div className="text-right">
                        <p>Servicios: {user.servicios}</p>
                        <p>Dinero: ${user.dineroGenerado.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
