// Ruta: app/dashboard/ofertas/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  addToast,
  Switch,
} from "@heroui/react";
import axios from "axios";

import { TrashIcon, PencilIcon, XMarkIcon } from "@/components/icons";

// --- Constantes y Tipos (sin cambios) ---
const tiposOferta = [
  { key: "PORCENTAJE", label: "Porcentaje (%)" },
  { key: "MONTO_FIJO", label: "Monto Fijo ($)" },
];
const todasLasCategorias = [
  "Cerveza",
  "Ron",
  "Whisky",
  "Vodka",
  "Tequila",
  "Ginebra",
  "Vino Tinto",
  "Vino Blanco",
  "Vino Rosado",
  "Aguardiente / Anisados",
  "Sangría / Cocteles Preparados",
  "Brandy / Coñac",
  "Licores / Cremas",
  "Champagne / Espumosos",
  "Bebidas sin Alcohol",
  "Hamburguesas",
  "Perros Calientes (Hot Dogs)",
  "Pizzas",
  "Salchipapas / Papas Fritas",
  "Pepitos",
  "Empanadas",
  "Tacos / Burritos",
  "Tequeños / Dedos de Queso",
  "Shawarmas / Döner Kebab",
  "Alitas de Pollo / Costillas",
  "Parrilla / Pinchos",
  "Pastelitos",
  "Mazorcas / Elotes",
  "Dulces / Postres",
  "Snacks / Pasapalos",
];

interface OfertaForm {
  _id?: string;
  nombre: string;
  tipo: string;
  valor: number | string;
  productos_aplicables: string[];
  categorias_aplicables: string[];
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface OfertaStored extends OfertaForm {
  _id: string;
  createdAt: string;
}
interface ProductoSimple {
  _id: string;
  nombre: string;
}

interface OfertaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: OfertaForm) => void;
  oferta: OfertaForm | null;
  isEditMode: boolean;
}

const initialState: OfertaForm = {
  nombre: "",
  tipo: "PORCENTAJE",
  valor: "",
  productos_aplicables: [],
  categorias_aplicables: [],
  fecha_inicio: "",
  fecha_fin: "",
  activo: true,
};

// --- Componente del Formulario Modal (ACTUALIZADO) ---
const OfertaFormModal: React.FC<OfertaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  oferta,
  isEditMode,
}) => {
  const [formData, setFormData] = useState<OfertaForm>(initialState);
  const [productosVendedor, setProductosVendedor] = useState<ProductoSimple[]>(
    [],
  );

  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [isCategoriaListOpen, setIsCategoriaListOpen] = useState(false);
  const [isProductoListOpen, setIsProductoListOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios
        .get("/api/dashboard/productos")
        .then((res) => setProductosVendedor(res.data.data))
        .catch(() =>
          addToast({
            title: "Error",
            description: "No se pudieron cargar tus productos.",
            color: "danger",
          }),
        );
    }
  }, [isOpen]);

  const formatDateTimeForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const fecha = new Date(dateString);

      // Helper para añadir un cero inicial si es necesario (ej. 5 -> "05")
      const pad = (num: number) => String(num).padStart(2, "0");

      // Obtenemos los componentes en la zona horaria LOCAL del navegador
      const yyyy = fecha.getFullYear();
      const mm = pad(fecha.getMonth() + 1); // getMonth es 0-indexado
      const dd = pad(fecha.getDate());
      const hh = pad(fecha.getHours());
      const min = pad(fecha.getMinutes());

      // Devolvemos el string en el formato que el input "datetime-local" espera
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initialFormState =
        isEditMode && oferta
          ? {
              ...oferta
            }
          : initialState;

      setFormData(initialFormState);
      setBusquedaCategoria("");
      setBusquedaProducto("");
    }
  }, [isOpen, isEditMode, oferta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSingleSelectChange = (keys: unknown) => {
    const keySet = keys as Set<React.Key>;
    const tipo = Array.from(keySet)[0];

    if (tipo) setFormData((p) => ({ ...p, tipo: String(tipo) }));
  };

  const handleSelectCategoria = (categoria: string) => {
    if (!formData.categorias_aplicables.includes(categoria)) {
      setFormData((prev) => ({
        ...prev,
        categorias_aplicables: [...prev.categorias_aplicables, categoria],
      }));
    }
    setBusquedaCategoria("");
    setIsCategoriaListOpen(false);
  };
  const handleDeselectCategoria = (categoria: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias_aplicables: prev.categorias_aplicables.filter(
        (c) => c !== categoria,
      ),
    }));
  };

  const handleSelectProducto = (productoId: string) => {
    if (!formData.productos_aplicables.includes(productoId)) {
      setFormData((prev) => ({
        ...prev,
        productos_aplicables: [...prev.productos_aplicables, productoId],
      }));
    }
    setBusquedaProducto("");
    setIsProductoListOpen(false);
  };
  const handleDeselectProducto = (productoId: string) => {
    setFormData((prev) => ({
      ...prev,
      productos_aplicables: prev.productos_aplicables.filter(
        (p) => p !== productoId,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formData.productos_aplicables.length === 0 &&
      formData.categorias_aplicables.length === 0
    ) {
      addToast({
        title: "Validación fallida",
        description: "Debes seleccionar al menos una categoría o un producto.",
        color: "warning",
      });

      return;
    }
    onSubmit(formData);
  };

  const categoriasFiltradas = todasLasCategorias.filter(
    (c) =>
      c.toLowerCase().includes(busquedaCategoria.toLowerCase()) &&
      !formData.categorias_aplicables.includes(c),
  );
  const productosFiltrados = productosVendedor.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) &&
      !formData.productos_aplicables.includes(p._id),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? "Editar Oferta" : "Crear Nueva Oferta"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            required
            label="Nombre de la Oferta"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              isRequired
              label="Tipo de Descuento"
              selectedKeys={[formData.tipo]}
              onSelectionChange={handleSingleSelectChange}
            >
              {tiposOferta.map((t) => (
                <SelectItem key={t.key}>{t.label}</SelectItem>
              ))}
            </Select>
            <Input
              required
              label="Valor del Descuento"
              name="valor"
              type="number"
              value={String(formData.valor)}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Input
              label="Categorías Aplicables"
              placeholder="Busca una categoría..."
              value={busquedaCategoria}
              onBlur={() =>
                setTimeout(() => setIsCategoriaListOpen(false), 150)
              }
              onChange={(e) => setBusquedaCategoria(e.target.value)}
              onFocus={() => setIsCategoriaListOpen(true)}
            />
            {isCategoriaListOpen &&
              busquedaCategoria &&
              categoriasFiltradas.length > 0 && (
                <ul className="absolute z-30 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {categoriasFiltradas.map((c) => (
                    <li
                      key={c}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <button onMouseDown={() => handleSelectCategoria(c)}>
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categorias_aplicables.map((c) => (
                <div
                  key={c}
                  className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
                >
                  {c}{" "}
                  <button
                    className="ml-2 text-gray-600 hover:text-black"
                    type="button"
                    onClick={() => handleDeselectCategoria(c)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <Input
              label="Productos Específicos Aplicables"
              placeholder="Busca un producto..."
              value={busquedaProducto}
              onBlur={() => setTimeout(() => setIsProductoListOpen(false), 150)}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              onFocus={() => setIsProductoListOpen(true)}
            />
            {isProductoListOpen &&
              busquedaProducto &&
              productosFiltrados.length > 0 && (
                <ul className="absolute z-30 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {productosFiltrados.map((p) => (
                    <li
                      key={p._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <button onMouseDown={() => handleSelectProducto(p._id)}>
                        {p.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.productos_aplicables.map((pId) => {
                const producto = productosVendedor.find((p) => p._id === pId);

                return (
                  <div
                    key={pId}
                    className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                  >
                    {producto?.nombre || "..."}{" "}
                    <button
                      className="ml-2 text-blue-600 hover:text-black"
                      type="button"
                      onClick={() => handleDeselectProducto(pId)}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-500 -mt-2">
            Debes seleccionar al menos una categoría o un producto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              label="Fecha y Hora de Inicio"
              labelPlacement="outside-top"
              name="fecha_inicio"
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={handleChange}
            />
            <Input
              label="Fecha y Hora de Fin (opcional)"
              labelPlacement="outside-top"
              name="fecha_fin"
              type="datetime-local"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              isSelected={formData.activo}
              onValueChange={(v) => setFormData((p) => ({ ...p, activo: v }))}
            />
            <label className="text-sm font-medium" htmlFor="activo">
              Oferta Activa
            </label>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button className="bg-gray-200" type="button" onPress={onClose}>
              Cancelar
            </Button>
            <Button className="bg-[#007D8A] text-white" type="submit">
              {isEditMode ? "Guardar Cambios" : "Crear Oferta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página (ACTUALIZADO PARA MOSTRAR LA HORA) ---
export default function GestionOfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaStored[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] =
    useState<OfertaForm | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // CORRECCIÓN: El endpoint era ofertas, no promociones.
      const response = await axios.get("/api/dashboard/promociones");

      if (response.data.success) setOfertas(response.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar las ofertas.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAñadir = () => {
    setIsEditMode(false);
    setOfertaSeleccionada(null);
    setIsModalOpen(true);
  };

  const handleEditar = (oferta: OfertaStored) => {
    setIsEditMode(true);
    setOfertaSeleccionada(oferta);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta oferta?")) {
      try {
        await axios.delete(`/api/dashboard/promociones?id=${id}`);
        addToast({
          title: "Éxito",
          description: "Oferta eliminada correctamente.",
        });
        fetchData();
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo eliminar la oferta.",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: OfertaForm) => {
    try {
      if (isEditMode && formData._id) {
        await axios.put(
          `/api/dashboard/promociones?id=${formData._id}`,
          formData,
        );
        addToast({ title: "Éxito", description: "Oferta actualizada." });
      } else {
        await axios.post("/api/dashboard/promociones", formData);
        addToast({ title: "Éxito", description: "Oferta creada." });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "No se pudo guardar la oferta.";

      addToast({ title: "Error", description: errorMsg, color: "danger" });
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Cargando ofertas...</div>;

  return (
    <>
      <OfertaFormModal
        isEditMode={isEditMode}
        isOpen={isModalOpen}
        oferta={ofertaSeleccionada}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <div className="p-4 md:p-6 space-y-6 bg-white min-h-screen text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Ofertas</h1>
          <Button
            className="bg-[#007D8A] text-white font-semibold"
            onPress={handleAñadir}
          >
            Añadir Oferta
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertas.map((oferta) => (
            <Card key={oferta._id} className="shadow-lg">
              <CardBody className="p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{oferta.nombre}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${oferta.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {oferta.activo ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-blue-600 font-semibold">
                  {oferta.tipo === "PORCENTAJE"
                    ? `${oferta.valor}% de descuento`
                    : `$${oferta.valor} de descuento`}
                </p>
                <div className="text-sm text-gray-500 mt-3">
                  <p>
                    Aplica a:{" "}
                    {oferta.categorias_aplicables?.length > 0
                      ? `${oferta.categorias_aplicables.join(", ")}`
                      : oferta.productos_aplicables?.length > 0
                        ? `${oferta.productos_aplicables.length} producto(s)`
                        : "Toda la tienda"}
                  </p>
                  {/* --- VISUALIZACIÓN ACTUALIZADA --- */}
                  <p>
                    Válida desde:{" "}
                    {new Date(oferta.fecha_inicio).toLocaleString("es-VE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  {oferta.fecha_fin && (
                    <p>
                      Hasta:{" "}
                      {new Date(oferta.fecha_fin).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-4 flex justify-end gap-2">
                  <Button
                    isIconOnly
                    className="bg-orange-500 text-white"
                    size="sm"
                    onPress={() => handleEditar(oferta)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    isIconOnly
                    className="bg-red-600 text-white"
                    size="sm"
                    onPress={() => handleEliminar(oferta._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        {ofertas.length === 0 && !isLoading && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-gray-500">Aún no has creado ninguna oferta.</p>
            <Button
              className="mt-4 bg-[#007D8A] text-white"
              onPress={handleAñadir}
            >
              Crear mi primera oferta
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
