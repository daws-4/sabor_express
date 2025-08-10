"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  addToast,
  Switch,
  Card,
} from "@heroui/react";
import axios from "axios";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";

import { TrashIcon } from "@/components/icons"; // Asume que tienes un icono de basura
import { SecureS3Image } from "@/components/SecureS3Image";

// --- Constantes y Tipos ---
const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const redesSocialesDisponibles = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X",
  "Otro",
].map((r) => ({ key: r, label: r }));

const coordenadasCapitales: { [key: string]: { lat: number; lng: number } } = {
  Amazonas: { lat: 5.6667, lng: -67.6167 },
  Anzoátegui: { lat: 10.1333, lng: -64.7167 },
  Apure: { lat: 7.8833, lng: -67.4667 },
  Aragua: { lat: 10.25, lng: -67.6 },
  Barinas: { lat: 8.6333, lng: -70.2167 },
  Bolívar: { lat: 8.1167, lng: -63.55 },
  Carabobo: { lat: 10.2167, lng: -68 },
  Cojedes: { lat: 9.6667, lng: -68.5833 },
  "Delta Amacuro": { lat: 9.05, lng: -62.0667 },
  "Distrito Capital": { lat: 10.5, lng: -66.9167 },
  Falcón: { lat: 11.4, lng: -69.6667 },
  Guárico: { lat: 9.9167, lng: -67.35 },
  Lara: { lat: 10.0667, lng: -69.3167 },
  Mérida: { lat: 8.6, lng: -71.15 },
  Miranda: { lat: 10.25, lng: -66.5833 },
  Monagas: { lat: 9.75, lng: -63.1833 },
  "Nueva Esparta": { lat: 10.9667, lng: -63.8833 },
  Portuguesa: { lat: 9.5667, lng: -69.2 },
  Sucre: { lat: 10.45, lng: -64.1833 },
  Táchira: { lat: 7.7667, lng: -72.2333 },
  Trujillo: { lat: 9.3667, lng: -70.4333 },
  Vargas: { lat: 10.6, lng: -66.9333 },
  Yaracuy: { lat: 10.3, lng: -68.7333 },
  Zulia: { lat: 10.6667, lng: -71.6167 },
};

type Horario = { dia: string; abre: string; cierra: string; abierto: boolean };
type RedSocial = { nombre: string; enlace?: string; usuario?: string };
type UbicacionGoogle = {
  placeId?: string;
  nombre?: string;
  direccionFormateada?: string;
  enlace?: string;
  lat?: number;
  lng?: number;
};
type VendedorData = {
  nombre: string;
  direccion: string;
  estado: string;
  telefono1: string;
  telefono2?: string;
  redes_sociales: RedSocial[];
  horario: Horario[];
  imagenes: string[];
  ubicacionGoogle?: UbicacionGoogle;
};

const libraries: "places"[] = ["places"];

// --- Componente para la Búsqueda de Autocompletado ---
const PlaceAutocomplete = ({
  onPlaceSelect,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!map || !inputRef.current || autocomplete) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "place_id", "url", "formatted_address"],
    });

    setAutocomplete(ac);
    ac.addListener("place_changed", () => {
      onPlaceSelect(ac.getPlace());
    });
  }, [map, onPlaceSelect, autocomplete]);

  return (
    <Input
      ref={inputRef}
      className="mb-4"
      placeholder="Buscar mi negocio en Google Maps..."
    />
  );
};

// --- Componente Principal ---
export default function ConfiguracionVendedorPage() {
  const [formData, setFormData] = useState<VendedorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [useGooglePlace, setUseGooglePlace] = useState(true);
  const [previewsToUpload, setPreviewsToUpload] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const GOOGLEMAPS_APIKEY = process.env.NEXT_PUBLIC_GOOGLEMAPS_APIKEY;

  const fetchVendedorData = useCallback(async () => {
    try {
      const response = await axios.get("/api/dashboard/config");

      if (response.data.success) {
        const data = response.data.data;
        const horarioCompleto = diasSemana.map((dia) => {
          const diaExistente = data.horario?.find(
            (h: { dia: string }) => h.dia === dia,
          );

          return (
            diaExistente || {
              dia,
              abre: "09:00",
              cierra: "17:00",
              abierto: false,
            }
          );
        });

        setFormData({
          ...data,
          horario: horarioCompleto,
          redes_sociales: data.redes_sociales || [],
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron cargar tus datos.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendedorData();
  }, [fetchVendedorData]);

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (!place) return;
      const location = place.geometry?.location;

      if (location) {
        setFormData((prev) =>
          prev
            ? {
                ...prev,
                ubicacionGoogle: {
                  placeId: place.place_id,
                  nombre: place.name,
                  direccionFormateada: place.formatted_address,
                  enlace: place.url,
                  lat: location.lat(),
                  lng: location.lng(),
                },
              }
            : null,
        );
      }
    },
    [],
  );

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              ubicacionGoogle: {
                placeId: undefined,
                nombre: undefined,
                direccionFormateada: undefined,
                enlace: undefined,
                lat: e.latLng!.lat(),
                lng: e.latLng!.lng(),
              },
            }
          : null,
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nameParts = name.split(".");

    setFormData((prev) => {
      if (!prev) return null;
      let newFormData = { ...prev };

      if (nameParts.length > 1) {
        const [parentKey, index, childKey] = nameParts;

        if (parentKey === "redes_sociales" && newFormData.redes_sociales) {
          const socialIndex = parseInt(index, 10);
          const updatedSocials = [...newFormData.redes_sociales];

          updatedSocials[socialIndex] = {
            ...updatedSocials[socialIndex],
            [childKey]: value,
          };

          return { ...newFormData, redes_sociales: updatedSocials };
        }
      }

      return { ...newFormData, [name]: value };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("red_social_nombre_")) {
      const index = parseInt(name.split("_")[3], 10);

      setFormData((prev) => {
        if (!prev) return null;
        const updatedSocials = [...prev.redes_sociales];

        updatedSocials[index].nombre = value;

        return { ...prev, redes_sociales: updatedSocials };
      });
    }
  };

  const handleHorarioChange = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    setFormData((prev) => {
      if (!prev) return null;
      const nuevoHorario = [...prev.horario];

      (nuevoHorario[index] as any)[field] = value;

      return { ...prev, horario: nuevoHorario };
    });
  };

  // --- MANEJADORES DE IMÁGENES ACTUALIZADOS ---
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;
    const newPreviews = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviewsToUpload((prev) => [...prev, ...newPreviews]);
  };

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
        setFormData((prev) =>
          prev
            ? { ...prev, imagenes: prev.imagenes.filter((_, i) => i !== index) }
            : null,
        );
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

      if (data.success) setFullScreenImage(data.url);
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo cargar la imagen.",
        color: "danger",
      });
    }
  };

  // --- handleSubmit ACTUALIZADO PARA INCLUIR LA SUBIDA DE IMÁGENES ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);

    let finalImageUrls = [...formData.imagenes];

    try {
      if (previewsToUpload.length > 0) {
        addToast({
          title: "Subiendo imágenes...",
          description: "Este proceso puede tardar un momento.",
        });
        const uploadPromises = previewsToUpload.map(async (preview) => {
          const { data } = await axios.post("/api/upload-url", {
            fileType: preview.file.type,
          });

          if (!data.success)
            throw new Error("No se pudo obtener la URL de subida.");
          const { uploadUrl, imageUrl } = data;

          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": preview.file.type },
            body: preview.file,
          });

          return imageUrl;
        });
        const newImageUrls = await Promise.all(uploadPromises);

        finalImageUrls.push(...newImageUrls);
      }

      const finalFormData = { ...formData, imagenes: finalImageUrls };

      await axios.put("/api/dashboard/config", finalFormData);
      addToast({
        title: "Éxito",
        description: "Tu perfil ha sido actualizado.",
        color: "success",
      });
      fetchVendedorData(); // Re-sincronizar datos por si acaso
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
      setPreviewsToUpload([]);
    }
  };
  const handleAddSocial = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            redes_sociales: [
              ...prev.redes_sociales,
              { nombre: "Instagram", enlace: "", usuario: "" },
            ],
          }
        : null,
    );
  };

  const handleRemoveSocial = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            redes_sociales: prev.redes_sociales.filter((_, i) => i !== index),
          }
        : null,
    );
  };

  if (isLoading) return <div className="p-6 text-center">Cargando...</div>;
  if (!formData)
    return (
      <div className="p-6 text-center text-red-500">
        Error al cargar los datos.
      </div>
    );
  if (!GOOGLEMAPS_APIKEY)
    return (
      <div className="p-6 text-center text-orange-500">
        La clave de API de Google Maps no está configurada.
      </div>
    );

  const center = {
    lat:
      formData.ubicacionGoogle?.lat ||
      coordenadasCapitales[formData.estado]?.lat ||
      9.0,
    lng:
      formData.ubicacionGoogle?.lng ||
      coordenadasCapitales[formData.estado]?.lng ||
      -66.0,
  };

  return (
    <>
      {fullScreenImage && (
        <button
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60]"
          onClick={() => setFullScreenImage(null)}
        >
          <Card onClick={(e) => e.stopPropagation()}>
            <img
              alt="Previsualización"
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
      <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white text-black">
        <h1 className="text-3xl font-bold mb-8">Configuración de la Bodega</h1>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">Información General</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                required
                label="Nombre del Negocio"
                name="nombre"
                value={formData.nombre}
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
                label="Teléfono Secundario"
                name="telefono2"
                value={formData.telefono2 || ""}
                onChange={handleChange}
              />
              <Input
                required
                className="md:col-span-2"
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">Redes Sociales</legend>
            <div className="space-y-4">
              {formData.redes_sociales.map((red, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-b pb-4"
                >
                  <Select
                    label="Red Social"
                    placeholder="Selecciona"
                    selectedKeys={red.nombre ? [red.nombre] : []}
                    onSelectionChange={(keys) =>
                      handleSelectChange(
                        `red_social_nombre_${index}`,
                        Array.from(keys)[0] as string,
                      )
                    }
                  >
                    {redesSocialesDisponibles.map((rs) => (
                      <SelectItem key={rs.key}>{rs.label}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Usuario (ej. @usuario)"
                    name={`redes_sociales.${index}.usuario`}
                    value={red.usuario || ""}
                    onChange={handleChange}
                  />
                  <div className="flex items-end">
                    <Button
                      isIconOnly
                      aria-label="Eliminar red social"
                      color="danger"
                      type="button"
                      onPress={() => handleRemoveSocial(index)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4 bg-gray-200"
              type="button"
              onPress={handleAddSocial}
            >
              Añadir Red Social
            </Button>
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">
              Ubicación en Google Maps
            </legend>
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                isSelected={useGooglePlace}
                onValueChange={setUseGooglePlace}
              />
              <p>Buscar mi local en Google</p>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {useGooglePlace
                ? "Busca tu negocio para enlazarlo a Google Maps."
                : "Arrastra el marcador rojo a la ubicación exacta de tu bodega."}
            </p>

            <APIProvider apiKey={GOOGLEMAPS_APIKEY} libraries={libraries}>
              <div
                style={{ height: "400px", width: "100%", position: "relative" }}
              >
                <Map
                  defaultCenter={center}
                  defaultZoom={13}
                  disableDefaultUI={false}
                  gestureHandling={"greedy"}
                  mapId={"vendedor-map-config"}
                  scrollwheel={true}
                  style={{ borderRadius: "0.5rem" }}
                  zoomControl={true}
                >
                  {/* Marcador Manual (arrastrable) */}
                  {!useGooglePlace && (
                    <AdvancedMarker
                      draggable={true}
                      position={center}
                      onDragEnd={onMarkerDragEnd}
                    />
                  )}
                  {/* Marcador de Google Place (estático) */}
                  {useGooglePlace && formData.ubicacionGoogle?.placeId && (
                    <AdvancedMarker position={center} />
                  )}
                </Map>
                {useGooglePlace && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      width: "60%",
                    }}
                  >
                    <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                  </div>
                )}
              </div>
            </APIProvider>

            {/* Nueva sección para mostrar datos del lugar seleccionado */}
            {useGooglePlace && formData.ubicacionGoogle?.placeId && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-800">
                  Lugar Seleccionado en Google Maps
                </h4>
                <p className="text-gray-900 mt-1 font-medium">
                  {formData.ubicacionGoogle.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.ubicacionGoogle.direccionFormateada}
                </p>
              </div>
            )}
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">Horario de Atención</legend>
            <div className="space-y-3">
              {formData.horario.map((h, index) => (
                <div
                  key={h.dia}
                  className="grid grid-cols-4 gap-3 items-center"
                >
                  <span className="font-medium">{h.dia}</span>
                  <Input
                    disabled={!h.abierto}
                    type="time"
                    value={h.abre}
                    onChange={(e) =>
                      handleHorarioChange(index, "abre", e.target.value)
                    }
                  />
                  <Input
                    disabled={!h.abierto}
                    type="time"
                    value={h.cierra}
                    onChange={(e) =>
                      handleHorarioChange(index, "cierra", e.target.value)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={h.abierto}
                      onValueChange={(v) =>
                        handleHorarioChange(index, "abierto", v)
                      }
                    />
                    <span>{h.abierto ? "Abierto" : "Cerrado"}</span>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="p-4 border border-gray-300 rounded-lg">
            <legend className="font-semibold px-2">Galería de Imágenes</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Imágenes ya guardadas */}
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
              {/* Nuevas previsualizaciones */}
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
                className={`w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center ${isSaving ? "cursor-not-allowed bg-gray-100" : "cursor-pointer hover:bg-gray-50"}`}
              >
                <span className="text-gray-500">
                  {isSaving ? "Guardando..." : "+ Añadir"}
                </span>
                <input
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving}
                  type="file"
                  onChange={handleImageSelection}
                />
              </label>
            </div>
          </fieldset>

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
    </>
  );
}
