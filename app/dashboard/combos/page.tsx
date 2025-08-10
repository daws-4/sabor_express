"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardBody, Input, Button, addToast, Switch } from "@heroui/react";
import axios from "axios";

import { TrashIcon, SearchIcon } from "@/components/icons"; // Asume que tienes estos iconos
import { SecureS3Image } from "@/components/SecureS3Image";

// --- Tipos de Datos ---
type ProductoSimple = { _id: string; nombre: string; marca?: string };
type ComboProductoForm = { producto: string; cantidad: number | string };
type ComboForm = {
  _id?: string;
  nombre: string;
  descripcion?: string;
  productos: ComboProductoForm[];
  precio: number | string;
  imagenes: string[];
  publicado: boolean;
};
// CORREGIDO: Se usa Omit para redefinir 'productos' de forma clara y evitar ambigüedad.
type ComboStored = Omit<ComboForm, "productos"> & {
  _id: string;
  createdAt: string;
  productos: { producto: ProductoSimple; cantidad: number }[];
};

type ComboFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ComboForm) => void;
  combo: ComboForm | null;
  isEditMode: boolean;
  productosDisponibles: ProductoSimple[];
};

// --- Componente del Formulario Modal ---
const ComboFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  combo,
  isEditMode,
  productosDisponibles,
}: ComboFormModalProps) => {
  const [formData, setFormData] = useState<ComboForm>({
    nombre: "",
    descripcion: "",
    productos: [],
    precio: "",
    imagenes: [],
    publicado: true,
  });
  const [searchTermProducto, setSearchTermProducto] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewsToUpload, setPreviewsToUpload] = useState<
    { file: File; previewUrl: string }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      const initialState =
        isEditMode && combo
          ? combo
          : {
              nombre: "",
              descripcion: "",
              productos: [],
              precio: "",
              imagenes: [],
              publicado: true,
            };

      setFormData(initialState);
      setPreviewsToUpload([]); // Limpiar previsualizaciones
    }
  }, [isOpen, isEditMode, combo]);
  // Limpieza de memoria para las previsualizaciones
  useEffect(() => {
    return () => {
      previewsToUpload.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previewsToUpload]);

  const productosFiltrados = useMemo(() => {
    if (!searchTermProducto) return [];

    return productosDisponibles.filter((p) =>
      p.nombre.toLowerCase().includes(searchTermProducto.toLowerCase()),
    );
  }, [searchTermProducto, productosDisponibles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductoCantidadChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newProductos = [...prev.productos];

      newProductos[index] = { ...newProductos[index], cantidad: value };

      return { ...prev, productos: newProductos };
    });
  };

  const handleAddProducto = (producto: ProductoSimple) => {
    setFormData((prev) => ({
      ...prev,
      productos: [...prev.productos, { producto: producto._id, cantidad: 1 }],
    }));
    setSearchTermProducto(""); // Limpiar búsqueda
  };

  const handleRemoveProducto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  // Solo crea previsualizaciones
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;
    const newPreviews = Array.from(files).map((file) => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviewsToUpload((prev) => [...prev, ...newPreviews]);
  };

  // Sube las imágenes a S3 al enviar el formulario
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

          if (!uploadResponse.ok) throw new Error("Error al subir a S3");

          return imageUrl;
        });
        const newImageUrls = await Promise.all(uploadPromises);

        finalImageUrls.push(...newImageUrls);
      }
      onSubmit({ ...formData, imagenes: finalImageUrls });
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron subir las imágenes.",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };
  // Elimina previsualizaciones o imágenes de S3
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
        addToast({
          title: "Error",
          description: "No se pudo eliminar la imagen de S3.",
          color: "danger",
        });
      }
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
        <button
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60]"
          onClick={() => setFullScreenImage(null)}
        >
          <Card onClick={(e) => e.stopPropagation()}>
            <img
              alt="Previsualización a tamaño completo"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              src={fullScreenImage}
            />
          </Card>
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer"
            onClick={() => setFullScreenImage(null)}
          >
            &times;
          </button>
        </button>
      )}

      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">
            {isEditMode ? "Editar Combo" : "Crear Nuevo Combo"}
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">
                Información del Combo
              </legend>
              <div className="space-y-4">
                <Input
                  required
                  label="Nombre del Combo"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                <Input
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleChange}
                />
                <Input
                  required
                  label="Precio del Combo ($)"
                  name="precio"
                  type="number"
                  value={String(formData.precio)}
                  onChange={handleChange}
                />
                <div className="flex items-center space-x-2 pt-2">
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

            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">
                Productos en el Combo
              </legend>
              <div className="space-y-4">
                {/* Productos ya añadidos */}
                {formData.productos.map((p, index) => {
                  const productoInfo = productosDisponibles.find(
                    (pd) => pd._id === p.producto,
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-b pb-4"
                    >
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-700">
                          {productoInfo?.nombre || "Producto no encontrado"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {productoInfo?.marca}
                        </p>
                      </div>
                      <Input
                        required
                        label="Cantidad"
                        min="1"
                        type="number"
                        value={String(p.cantidad)}
                        onChange={(e) =>
                          handleProductoCantidadChange(index, e.target.value)
                        }
                      />
                      <Button
                        isIconOnly
                        aria-label="Eliminar producto"
                        color="danger"
                        type="button"
                        onPress={() => handleRemoveProducto(index)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  );
                })}
              </div>
              {/* Buscador para añadir nuevos productos */}
              <div className="mt-4">
                <Input
                  placeholder="Buscar producto para añadir..."
                  startContent={<SearchIcon className="text-gray-400" />}
                  value={searchTermProducto}
                  onChange={(e) => setSearchTermProducto(e.target.value)}
                />
                {productosFiltrados.length > 0 && (
                  <ul className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                    {productosFiltrados.map((prod) => (
                      <li
                        key={prod._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <button onClick={() => handleAddProducto(prod)}>
                          {prod.nombre}{" "}
                          <span className="text-gray-500 text-sm">
                            ({prod.marca || "Sin marca"})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg">
              <legend className="font-semibold px-2">Imágenes del Combo</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                      onPress={() => handleRemoveImage(imgUrl, index, false)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
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
                      onPress={() =>
                        handleRemoveImage(preview.previewUrl, index, true)
                      }
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
              <Button className="bg-[#007D8A] text-white" type="submit">
                {isEditMode ? "Guardar Cambios" : "Crear Combo"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// --- Componente Principal de la Página ---
export default function GestionCombosPage() {
  const [combos, setCombos] = useState<ComboStored[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<
    ProductoSimple[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [comboSeleccionado, setComboSeleccionado] = useState<ComboForm | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [combosRes, productosRes] = await Promise.all([
        axios.get("/api/dashboard/combos"),
        axios.get("/api/dashboard/productos"),
      ]);

      if (combosRes.data.success) setCombos(combosRes.data.data);
      if (productosRes.data.success)
        setProductosDisponibles(productosRes.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const combosFiltrados = useMemo(
    () =>
      combos.filter((c) =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [combos, searchTerm],
  );

  const handleAñadir = () => {
    setIsEditMode(false);
    setComboSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditar = (combo: ComboStored) => {
    setIsEditMode(true);
    const comboParaForm = {
      ...combo,
      productos: combo.productos.map((p) => ({
        producto: p.producto._id,
        cantidad: p.cantidad,
      })),
    };

    setComboSeleccionado(comboParaForm);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este combo?")) {
      try {
        await axios.delete(`/api/dashboard/combos?id=${id}`);
        addToast({
          title: "Éxito",
          description: "Combo eliminado correctamente.",
        });
        fetchData();
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo eliminar el combo.",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: ComboForm) => {
    try {
      if (isEditMode && formData._id) {
        await axios.put(`/api/dashboard/combos?id=${formData._id}`, formData);
        addToast({
          title: "Éxito",
          description: "Combo actualizado correctamente.",
        });
      } else {
        await axios.post("/api/dashboard/combos", formData);
        addToast({
          title: "Éxito",
          description: "Combo creado correctamente.",
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "No se pudo guardar el combo.";

      addToast({ title: "Error", description: errorMsg, color: "danger" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Cargando combos...</div>
    );
  }

  return (
    <>
      <ComboFormModal
        combo={comboSeleccionado}
        isEditMode={isEditMode}
        isOpen={isModalOpen}
        productosDisponibles={productosDisponibles}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <div className="p-4 md:p-6 space-y-6 bg-white min-h-screen text-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Combos</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              className="w-full md:w-64"
              placeholder="Buscar combo por nombre..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="bg-[#007D8A] text-white font-semibold whitespace-nowrap"
              onPress={handleAñadir}
            >
              Añadir Combo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {combosFiltrados.map((combo) => (
            <Card key={combo._id} className="shadow-lg flex flex-col">
              {combo.imagenes.length > 0 ? (
                <SecureS3Image
                  alt={combo.nombre}
                  className="w-full h-40 object-cover rounded-t-xl"
                  s3Url={combo.imagenes[0]}
                />
              ) : (
                <img
                  alt={combo.nombre}
                  className="w-full h-40 object-cover rounded-t-xl"
                  src={
                    "https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen"
                  }
                />
              )}
              <CardBody className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{combo.nombre}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${combo.publicado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {combo.publicado ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex-grow">
                  {combo.descripcion}
                </p>
                <p className="text-lg font-semibold mt-2">
                  ${combo.precio.toLocaleString()}
                </p>
                <div className="mt-auto pt-4 flex justify-end gap-2">
                  <Button
                    className="text-sm bg-orange-500 text-white"
                    size="sm"
                    onPress={() => handleEditar(combo)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="text-sm bg-red-600 text-white"
                    size="sm"
                    onPress={() => handleEliminar(combo._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        {combos.length === 0 && !isLoading && (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <p className="text-gray-500">No tienes combos creados todavía.</p>
            <Button
              className="mt-4 bg-[#007D8A] text-white"
              onPress={handleAñadir}
            >
              Crear tu Primer Combo
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
