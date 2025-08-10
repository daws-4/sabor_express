"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, addToast } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";

// --- Tipos de Datos ---
type Metricas = {
  totalPedidos: number;
  pedidosTerminados: number;
  pedidosCancelados: number;
  totalGanancias: number;
};

type PedidoPendiente = {
  _id: string;
  usuario: { nombre: string; apellido: string };
  id_usuarioVendedor: { nombre: string };
  montoTotal: number;
  createdAt: string;
};

type GraficoStatus = { name: string; value: number };
type GraficoGanancias = { mes: string; ganancias: number };

// --- Componente Principal del Dashboard ---
export default function PedidosDashboard() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [pedidosPendientes, setPedidosPendientes] = useState<PedidoPendiente[]>(
    [],
  );
  const [graficoStatus, setGraficoStatus] = useState<GraficoStatus[]>([]);
  const [graficoGanancias, setGraficoGanancias] = useState<GraficoGanancias[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/dashboard");

        if (response.data.success) {
          const data = response.data.data;

          setMetricas(data.metricas);
          setPedidosPendientes(data.pedidosPendientes);
          setGraficoStatus(data.graficos.status);
          setGraficoGanancias(data.graficos.ganancias);
        }
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Se añade una firma de índice para que TypeScript permita el acceso dinámico.
  const COLORS: { [key: string]: string } = {
    entregado: "#22c55e", // Verde
    pendiente: "#f97316", // Naranja
    en_proceso: "#3b82f6", // Azul
    cancelado: "#ef4444", // Rojo
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando datos de pedidos...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard de Pedidos</h1>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#007D8A] text-white shadow-lg">
          <CardBody className="p-5">
            <p className="text-sm font-medium">Total de Pedidos</p>
            <p className="text-3xl font-bold">{metricas?.totalPedidos || 0}</p>
          </CardBody>
        </Card>
        <Card className="bg-green-500 text-white shadow-lg">
          <CardBody className="p-5">
            <p className="text-sm font-medium">Pedidos Terminados</p>
            <p className="text-3xl font-bold">
              {metricas?.pedidosTerminados || 0}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-red-500 text-white shadow-lg">
          <CardBody className="p-5">
            <p className="text-sm font-medium">Pedidos Cancelados</p>
            <p className="text-3xl font-bold">
              {metricas?.pedidosCancelados || 0}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-orange-500 text-white shadow-lg">
          <CardBody className="p-5">
            <p className="text-sm font-medium">Ganancias Totales</p>
            <p className="text-3xl font-bold">
              ${(metricas?.totalGanancias || 0).toLocaleString()}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Gráficos y Pedidos Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                Ganancias Mensuales (Pedidos Entregados)
              </h3>
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={graficoGanancias}>
                  <XAxis dataKey="mes" fontSize={12} stroke="#888888" />
                  <YAxis
                    fontSize={12}
                    stroke="#888888"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Ganancias",
                    ]}
                  />
                  <Bar
                    dataKey="ganancias"
                    fill="#007D8A"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                Distribución de Pedidos
              </h3>
              <ResponsiveContainer height={300} width="100%">
                <PieChart>
                  <Pie
                    label
                    cx="50%"
                    cy="50%"
                    data={graficoStatus}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                  >
                    {graficoStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name] || "#cccccc"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Lista de Pedidos Pendientes */}
      <section>
        <h2 className="text-xl font-bold mb-4">Últimos Pedidos Pendientes</h2>
        <Card className="shadow-lg">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3" scope="col">
                      Cliente
                    </th>
                    <th className="px-6 py-3" scope="col">
                      Vendedor
                    </th>
                    <th className="px-6 py-3" scope="col">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right" scope="col">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosPendientes.length > 0 ? (
                    pedidosPendientes.map((pedido) => (
                      <tr
                        key={pedido._id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {pedido.usuario?.nombre || "Usuario"}{" "}
                          {pedido.usuario?.apellido || "Eliminado"}
                        </td>
                        <td className="px-6 py-4">
                          {pedido.id_usuarioVendedor?.nombre || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(pedido.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ${pedido.montoTotal.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="text-center py-8 text-gray-500"
                        colSpan={4}
                      >
                        ¡Felicidades! No hay pedidos pendientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
