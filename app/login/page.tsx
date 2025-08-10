"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Input, addToast } from "@heroui/react";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";

export default function LoginComprador() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (res.status === 200) {
        addToast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
          color: "success",
        });
        // Redirige al dashboard principal o a la página de inicio
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Fallo en el login", err);
      let errorMessage = "Credenciales inválidas o error del servidor";

      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }

      addToast({
        title: "Error de Autenticación",
        description: errorMessage,
        color: "danger",
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Bienvenido de Vuelta
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <Input
            required
            className="w-full"
            label="Correo Electrónico"
            labelPlacement="outside"
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            required
            className="w-full"
            endContent={
              <button
                aria-label="toggle password visibility"
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
            label="Contraseña"
            labelPlacement="outside"
            type={isVisible ? "text" : "password"}
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            disabled={loading}
            type="submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
