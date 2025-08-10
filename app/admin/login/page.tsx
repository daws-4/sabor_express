"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Input, addToast } from "@heroui/react";

// import { addToast } from "@heroui/toast";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      const res = await axios.post("/api/admin/login", { username, password });

      if (res.status === 200) {
        router.push("/admin/dashboard");
        addToast({
          title: "Éxito",
          description: "Has iniciado sesión correctamente.",
          color: "success",
        });
      }
    } catch (err) {
      setError("Credenciales inválidas o error del servidor");
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          addToast({
            title: "Error",
            description: "Usuario o contraseña incorrectos.",
            color: "danger",
          });
          setError("Usuario o contraseña incorrectos");
        } else if (err.response.status === 400) {
          addToast({
            title: "Error",
            description: "Usuario no existe.",
            color: "danger",
          });
          setError("Usuario no existe");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1e6] p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003f63] mb-6 text-center">
          Inicia Sesión
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <Input
            required
            className="w-full"
            label="Usuario"
            labelPlacement="outside"
            value={username}
            variant="bordered"
            onChange={(e) => setUsername(e.target.value)}
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
            className="w-full bg-[#003f63] text-white py-2 rounded-lg font-semibold hover:bg-[#002b48] transition"
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
