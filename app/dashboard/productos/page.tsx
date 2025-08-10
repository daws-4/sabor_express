"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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

import { TrashIcon } from "@/components/icons"; // Asume que tienes un icono de basura
import { SecureS3Image } from "@/components/SecureS3Image";

// --- Constantes y Tipos ---

// Listas de categorías extraídas del Schema para usar en el frontend
const categoriasBebida = [
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
];
const categoriasComida = [
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

const tiposProducto = ["bebida", "comida", "otro"].map((t) => ({
  key: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));
const unidadesContenido = ["ml", "L", "g", "kg", "unidades"].map((u) => ({
  key: u,
  label: u,
}));

type ProductoForm = {
  _id?: string;
  nombre: string;
  descripcion?: string;
  marca?: string;
  tipo: string;
  categoria: string;
  subcategoria?: string;
  contenido: {
    valor: number | string;
    unidad: string;
  };
  precio: number | string;
  stock: number | string;
  imagenes: string[];
  publicado: boolean;
};

type ProductoStored = ProductoForm & { _id: string; createdAt: string };

type ProductoFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductoForm) => void;
  producto: ProductoForm | null;
  isEditMode: boolean;
};

const initialStateForm: ProductoForm = {
  nombre: "",
  descripcion: "",
  marca: "",
  tipo: "bebida",
  categoria: "",
  subcategoria: "",
  contenido: { valor: "", unidad: "ml" },
  precio: "",
  stock: 0,
  imagenes: [],
  publicado: true,
};

// --- Componente del Formulario Modal (ACTUALIZADO) ---
const ProductoFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  producto,
  isEditMode,
}: ProductoFormModalProps) => {
  const [formData, setFormData] = useState<ProductoForm>(initialStateForm);
  const [isUploading, setIsUploading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [previewsToUpload, setPreviewsToUpload] = useState<
    { file: File; previewUrl: string }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      const initialState = isEditMode && producto ? producto : initialStateForm;

      setFormData(initialState);
      setPreviewsToUpload([]); // Limpiar previsualizaciones al abrir
    }
  }, [isOpen, isEditMode, producto]);

  // Limpieza de memoria para los object URLs al cerrar el modal
  useEffect(() => {
    return () => {
      previewsToUpload.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previewsToUpload]);

  const categoriasDisponibles = useMemo(() => {
    if (formData.tipo === "bebida") return categoriasBebida;
    if (formData.tipo === "comida") return categoriasComida;

    return [];
  }, [formData.tipo]);

  useEffect(() => {
    if (!categoriasDisponibles.includes(formData.categoria)) {
      setFormData((prev) => ({ ...prev, categoria: "" }));
    }
  }, [categoriasDisponibles, formData.categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const valueToUpdate = type === "number" ? parseFloat(value) || "" : value;

    setFormData((prev) => {
      const newFormData = { ...prev };

      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");

        if (parentKey === "contenido") {
          newFormData.contenido = {
            ...newFormData.contenido,
            [childKey]: valueToUpdate,
          };
        }
      } else {
        (newFormData as any)[name] = valueToUpdate;
      }

      return newFormData;
    });
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value === null) return;
    setFormData((prev) => ({
      ...prev,
      ...(name === "tipo" && { tipo: value }),
      ...(name === "categoria" && { categoria: value }),
      ...(name === "contenido.unidad" && {
        contenido: { ...prev.contenido, unidad: value },
      }),
    }));
  };

  // Manejador de imágenes actualizado: solo crea previsualizaciones
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const newPreviews = Array.from(files).map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviewsToUpload((prev) => [...prev, ...newPreviews]);
  };
  // --- LÓGICA DE SUBIDA CON MEJOR MANEJO DE ERRORES ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setIsUploading(true);
    addToast({
      title: "Subiendo imágenes...",
      description: `Subiendo ${files.length} archivo(s).`,
    });

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { data } = await axios.post("/api/upload-url", {
          fileType: file.type,
        });

        if (!data.success)
          throw new Error("No se pudo obtener la URL de subida.");

        const { uploadUrl, imageUrl } = data;

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          // --- AQUÍ OBTENEMOS EL DETALLE DEL ERROR ---
          const errorDetails = await uploadResponse.text(); // S3 devuelve un XML con el error

          console.error("Error de S3:", errorDetails);
          throw new Error(`Error al subir a S3: ${uploadResponse.statusText}`);
        }

        return imageUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImageUrls],
      }));
      addToast({
        title: "Éxito",
        description: "Imágenes subidas correctamente.",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        description: "No se pudieron subir las imágenes. Revisa la consola.",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };
  // Manejador de eliminación actualizado: distingue entre previsualizaciones y subidas
  const handleRemoveImage = async (
    source: string,
    index: number,
    isPreview: boolean,
  ) => {
    if (isPreview) {
      const previewToRemove = previewsToUpload[index];

      URL.revokeObjectURL(previewToRemove.previewUrl);
      setPreviewsToUpload((prev) => prev.filter((_, i) => i !== index));
    } else {
      try {
        const fileKey = source.split("/").pop();

        await axios.delete("/api/upload-url", { data: { fileKey } });
        setFormData((prev) => ({
          ...prev,
          imagenes: prev.imagenes.filter((_, i) => i !== index),
        }));
        addToast({ title: "Éxito", description: "Imagen eliminada de S3." });
      } catch (error) {
        console.error(error);
        addToast({
          title: "Error",
          description: "No se pudo eliminar la imagen de S3.",
          color: "danger",
        });
      }
    }
  };

  // Submit actualizado: la subida a S3 ocurre aquí
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrls = [...formData.imagenes];

    try {
      if (previewsToUpload.length > 0) {
        addToast({
          title: "Subiendo imágenes...",
          description: "Por favor espera.",
        });

        const uploadPromises = previewsToUpload.map(async (preview) => {
          const { data } = await axios.post("/api/upload-url", {
            fileType: preview.file.type,
          });

          if (!data.success)
            throw new Error("No se pudo obtener la URL de subida.");

          const { uploadUrl, imageUrl } = data;

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": preview.file.type },
            body: preview.file,
          });

          if (!uploadResponse.ok) {
            const errorDetails = await uploadResponse.text();

            console.error("Error de S3:", errorDetails);
            throw new Error(
              `Error al subir a S3: ${uploadResponse.statusText}`,
            );
          }

          return imageUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);

        finalImageUrls.push(...newImageUrls);
      }

      const finalFormData = { ...formData, imagenes: finalImageUrls };

      onSubmit(finalFormData);
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        description: "No se pudieron subir las imágenes. Inténtalo de nuevo.",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewClick = async (s3Url: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const fileKey = s3Url.split("/").pop();
      const { data } = await axios.post("/api/get-image-url", { fileKey });

      if (data.success) {
        setFullScreenImage(data.url);
      } else {
        addToast({
          title: "Error",
          description: "No se pudo cargar la previsualización.",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo cargar la previsualización.",
        color: "danger",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {fullScreenImage && (
        <Card
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60]"
          onClick={() => setFullScreenImage(null)}
        >
          <button onClick={(e) => e.stopPropagation()}>
            <img
              alt="Previsualización a tamaño completo"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              src={fullScreenImage}
            />
          </button>
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer"
            onClick={() => setFullScreenImage(null)}
          >
            &times;
          </button>
        </Card>
      )}

      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">
            {isEditMode ? "Editar Producto" : "Crear Nuevo Producto"}
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Fieldset: Información Básica */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">Información Básica</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label="Nombre del Producto"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                <Input
                  label="Marca"
                  name="marca"
                  value={formData.marca || ""}
                  onChange={handleChange}
                />
                <Input
                  className="md:col-span-2"
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            {/* Fieldset: Categorización (ACTUALIZADO) */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">Categorización</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  isRequired
                  label="Tipo"
                  selectedKeys={[formData.tipo]}
                  onSelectionChange={(keys) =>
                    handleSelectChange("tipo", Array.from(keys)[0] as string)
                  }
                >
                  {tiposProducto.map((t) => (
                    <SelectItem key={t.key}>{t.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  isRequired
                  isDisabled={categoriasDisponibles.length === 0}
                  label="Categoría"
                  selectedKeys={formData.categoria ? [formData.categoria] : []}
                  onSelectionChange={(keys) =>
                    handleSelectChange(
                      "categoria",
                      Array.from(keys)[0] as string,
                    )
                  }
                >
                  {categoriasDisponibles.map((c) => (
                    <SelectItem key={c}>{c}</SelectItem>
                  ))}
                </Select>

                <Input
                  className="md:col-span-2"
                  label="Sub-categoría (Opcional)"
                  name="subcategoria"
                  value={formData.subcategoria || ""}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            {/* Fieldset: Precio e Inventario */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">
                Precio e Inventario
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label="Precio ($)"
                  name="precio"
                  type="number"
                  value={String(formData.precio)}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Cantidad en Stock"
                  name="stock"
                  type="number"
                  value={String(formData.stock)}
                  onChange={handleChange}
                />
                <div className="flex items-center space-x-2 pt-5 md:col-span-2">
                  <Switch
                    isSelected={formData.publicado}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, publicado: v }))
                    }
                  />
                  <label className="text-sm font-medium" htmlFor="publicado">
                    Publicado
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Fieldset: Detalles Físicos */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">Detalles Físicos</legend>
              <div className="flex gap-4">
                <Input
                  required
                  label="Contenido"
                  name="contenido.valor"
                  type="number"
                  value={String(formData.contenido.valor)}
                  onChange={handleChange}
                />
                <Select
                  isRequired
                  label="Unidad"
                  selectedKeys={[formData.contenido.unidad]}
                  onSelectionChange={(keys) =>
                    handleSelectChange(
                      "contenido.unidad",
                      Array.from(keys)[0] as string,
                    )
                  }
                >
                  {unidadesContenido.map((u) => (
                    <SelectItem key={u.key}>{u.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">
                Imágenes del Producto
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Renderizar imágenes ya guardadas */}
                {formData.imagenes.map((imgUrl, index) => (
                  <div key={imgUrl} className="relative group">
                    <button
                      className="cursor-pointer"
                      onClick={(e) => handlePreviewClick(imgUrl, e)}
                    >
                      <SecureS3Image
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        s3Url={imgUrl}
                      />
                    </button>
                    <Button
                      isIconOnly
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      color="danger"
                      size="sm"
                      onPress={() => {
                        handleRemoveImage(imgUrl, index, false);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
                {/* Renderizar previsualizaciones pendientes */}
                {previewsToUpload.map((preview, index) => (
                  <div key={preview.previewUrl} className="relative group">
                    <button
                      className="cursor-pointer"
                      onClick={() => setFullScreenImage(preview.previewUrl)}
                    >
                      <img
                        alt={`Previsualización ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border-2 border-dashed border-blue-400"
                        src={preview.previewUrl}
                      />
                    </button>
                    <Button
                      isIconOnly
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      color="danger"
                      size="sm"
                      onPress={() => {
                        handleRemoveImage(preview.previewUrl, index, true);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
                <label
                  className={`w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center ${isUploading ? "cursor-not-allowed bg-gray-100" : "cursor-pointer hover:bg-gray-50"}`}
                >
                  <span className="text-gray-500">
                    {isUploading ? "Guardando..." : "+ Añadir"}
                  </span>
                  <input
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    type="file"
                    onChange={handleImageSelection}
                  />
                </label>
              </div>
            </fieldset>

            <div className="flex justify-end gap-4 mt-6">
              <Button className="bg-gray-200" type="button" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                className="bg-[#007D8A] text-white"
                isLoading={isUploading}
                type="submit"
              >
                {isUploading
                  ? "Guardando..."
                  : isEditMode
                    ? "Guardar Cambios"
                    : "Crear Producto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// --- Componente Principal de la Página ---
export default function GestionProductosPage() {
  const [productos, setProductos] = useState<ProductoStored[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoForm | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const productosPorPagina = 12;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/dashboard/productos");

      if (response.data.success) {
        setProductos(response.data.data);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p) => tipoFiltro === "Todos" || p.tipo === tipoFiltro)
      .filter((p) => {
        const term = searchTerm.toLowerCase();

        return (
          p.nombre.toLowerCase().includes(term) ||
          (p.marca || "").toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term)
        );
      });
  }, [productos, searchTerm, tipoFiltro]);

  const paginasTotales = Math.ceil(
    productosFiltrados.length / productosPorPagina,
  );
  const productosPaginados = useMemo(() => {
    const inicio = (currentPage - 1) * productosPorPagina;

    return productosFiltrados.slice(inicio, inicio + productosPorPagina);
  }, [currentPage, productosFiltrados]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFiltro]);

  const handleAñadir = () => {
    setIsEditMode(false);
    setProductoSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditar = (producto: ProductoStored) => {
    setIsEditMode(true);
    setProductoSeleccionado(producto);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        await axios.delete(`/api/dashboard/productos?id=${id}`);
        addToast({
          title: "Éxito",
          description: "Producto eliminado correctamente.",
        });
        fetchData();
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo eliminar el producto.",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: ProductoForm) => {
    try {
      if (isEditMode && formData._id) {
        await axios.put(
          `/api/dashboard/productos?id=${formData._id}`,
          formData,
        );
        addToast({
          title: "Éxito",
          description: "Producto actualizado correctamente.",
        });
      } else {
        await axios.post("/api/dashboard/productos", formData);
        addToast({
          title: "Éxito",
          description: "Producto creado correctamente.",
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "No se pudo guardar el producto.";

      addToast({ title: "Error", description: errorMsg, color: "danger" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Cargando productos...</div>
    );
  }

  const filtroTipoOptions = [
    { key: "Todos", label: "Todos los tipos" },
    ...tiposProducto,
  ];

  return (
    <>
      <ProductoFormModal
        isEditMode={isEditMode}
        isOpen={isModalOpen}
        producto={productoSeleccionado}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <div className="p-4 md:p-6 space-y-6 bg-white min-h-screen text-black">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <Button
            className="bg-[#007D8A] text-white font-semibold"
            onPress={handleAñadir}
          >
            Añadir Producto
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            className="w-full"
            placeholder="Buscar por nombre, marca o categoría..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            className="w-full sm:max-w-xs"
            placeholder="Filtrar por tipo"
            selectedKeys={tipoFiltro !== "Todos" ? [tipoFiltro] : []}
            onSelectionChange={(keys) =>
              setTipoFiltro((Array.from(keys)[0] as string) || "Todos")
            }
          >
            {filtroTipoOptions.map((t) => (
              <SelectItem key={t.key}>{t.label}</SelectItem>
            ))}
          </Select>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosPaginados.map((producto) => (
            <Card key={producto._id} className="shadow-lg flex flex-col">
              {producto.imagenes.length > 0 ? (
                <SecureS3Image
                  alt={producto.nombre}
                  className="w-full h-40 object-cover rounded-t-xl"
                  s3Url={producto.imagenes[0]}
                />
              ) : (
                <img
                  alt={producto.nombre}
                  className="w-full h-40 object-cover rounded-t-xl"
                  src={
                    producto.imagenes[0] ||
                    "https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen"
                  }
                />
              )}
              <CardBody className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{producto.nombre}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${producto.publicado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {producto.publicado ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{producto.marca}</p>
                <p className="text-lg font-semibold mt-2">
                  ${Number(producto.precio).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Stock: {producto.stock}</p>
                <div className="mt-auto pt-4 flex justify-end gap-2">
                  <Button
                    className="text-sm bg-orange-500 text-white"
                    size="sm"
                    onPress={() => handleEditar(producto)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="text-sm bg-red-600 text-white"
                    size="sm"
                    onPress={() => handleEliminar(producto._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {paginasTotales > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              isDisabled={currentPage === 1}
              onPress={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-gray-700">
              Página {currentPage} de {paginasTotales}
            </span>
            <Button
              isDisabled={currentPage === paginasTotales}
              onPress={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Mensaje de no resultados */}
        {productosFiltrados.length === 0 && !isLoading && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-gray-500">
              No se encontraron productos con los filtros actuales.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
