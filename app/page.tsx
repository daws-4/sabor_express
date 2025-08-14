"use client";
import { CardBody, CardFooter, Card, Button, Form, Input } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

import { GooglePlayIcon, AppStoreIcon } from "@/components/icons";

// Componente para animar el contador de vendedores/restaurantes
function Counter({ to }: { to: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;

    if (start === end) return;

    const step = 10;
    const steps = Math.ceil(end / step);
    const totalMilSecDur = 4000;
    const incrementTime = Math.max(10, Math.floor(totalMilSecDur / steps));

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [to]);

  return <span>{count}</span>;
}

// Componente para animar el contador de usuarios
function CounterUser({ to }: { to: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;

    if (start === end) return;

    const step = 10;
    const steps = Math.ceil(end / step);
    const totalMilSecDur = 4000;
    const incrementTime = Math.max(10, Math.floor(totalMilSecDur / steps));

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [to]);

  return <span>{count}</span>;
}

export default function Home() {
  const stats = {
    sellers: 1200,
    users: 5000,
  };

  return (
    <div className="min-h-screen bg-[#f3f1e6] text-gray-900 font-sans">
      {/* NAVBAR + HERO */}
      <header className="bg-[#003f63] text-white">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Asegúrate de tener un logo para Sabor Express en la ruta especificada */}
            <img
              alt="Sabor Express Logo"
              className="h-14 w-14 shadow-lg shadow-black rounded-full"
              src="/imagen1.png"
            />
            <span className="text-xl font-bold">Sabor Express</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link className="hover:text-yellow-300 font-medium" href="/pricing">
              Precios
            </Link>
            <Link
              className="hover:text-yellow-300 font-medium"
              href="/register"
            >
              Registro
            </Link>
            <Link className="hover:text-yellow-300 font-medium" href="/login">
              Iniciar sesión
            </Link>
          </nav>
        </div>

        <div className="text-center py-20 px-6">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            Sabor Express 🍔
          </motion.h1>
          <motion.p
            animate={{ opacity: 1 }}
            className="mt-4 text-xl max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            La app para descubrir y pedir comida desde tu celular. Perfecta para restaurantes y amantes de la buena comida.
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              className="bg-[#f9e27b] text-[#003f63] px-8 py-3 rounded-full font-bold hover:bg-[#ffe168] transition"
              href="#cta"
              size="lg"
            >
              Descárgala ahora
            </Button>
            <Button
              className="bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-800 items-center justify-center"
              href="#"
              size="lg"
            >
              <GooglePlayIcon /> Google Play
            </Button>
            <Button
              className="bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-800"
              href="#"
              size="lg"
            >
              <AppStoreIcon />
              App Store
            </Button>
          </motion.div>
        </div>
      </header>

      {/* ESTADÍSTICAS DE USO */}
      <section className="py-16 px-6 bg-[#e3d9c6] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003f63] mb-4">
            Nuestra comunidad
          </h2>
          <p className="text-lg text-[#403d39] mb-8">
            Gracias por confiar en Sabor Express 🍔
          </p>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-4xl font-bold">
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white py-10 rounded-xl shadow text-[#003f63]"
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Counter to={stats.sellers} />
                <span className="block text-lg mt-2 font-normal text-[#403d39]">
                  Restaurantes afiliados
                </span>
              </motion.div>
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white py-10 rounded-xl shadow text-[#003f63]"
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <CounterUser to={stats.users} />
                <span className="block text-lg mt-2 font-normal text-[#403d39]">
                  Amantes de la comida
                </span>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* BENEFICIOS PARA RESTAURANTES */}
      <section className="py-16 px-6 bg-[#f3f1e6] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#285c3c] mb-6">
            ¿Tienes un restaurante?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#403d39] mb-6">
            Sabor Express te conecta con más clientes, aumenta tus ventas y
            digitaliza tu negocio. Recibe pedidos online y gestiona tu menú
            desde cualquier lugar.
          </p>
          {/* Reemplaza esta imagen por una relevante para restaurantes */}
          <img
            alt="Restaurante usando la app Sabor Express"
            className="mx-auto w-full max-w-[600px] h-[400px] object-cover rounded"
            src="/burguer2.jpg"
          />
        </div>
      </section>

      {/* BENEFICIOS PARA CONSUMIDORES */}
      <section className="py-16 px-6 bg-[#e3d9c6] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003f63] mb-6">
            ¿Te gusta comer con estilo?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#403d39] mb-6">
            Pide tus platos favoritos sin salir de casa y descubre las mejores recomendaciones para cada ocasión.
          </p>
          {/* Reemplaza esta imagen por una de gente disfrutando comida */}
          <img
            alt="Personas disfrutando de comida pedida por Sabor Express"
            className="mx-auto w-full max-w-[600px] h-[400px] object-cover rounded"
            src="/burguer1.jpg"
          />
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-16 px-6 bg-[#f3f1e6] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003f63] mb-8">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardBody className="bg-[#e3d9c6] p-6 rounded-xl shadow">
                {
                  '"Desde que uso Sabor Express, mis ventas han aumentado un 40%. ¡Una maravilla para mi restaurante!"'
                }
              </CardBody>
              <CardFooter className="mt-4 text-sm text-gray-600">
                — Juan, dueño de restaurante
              </CardFooter>
            </Card>
            <Card>
              <CardBody className="bg-[#e3d9c6] p-6 rounded-xl shadow">
                {
                  ' "La descargué por la variedad, me quedé por la rapidez. ¡La mejor app para pedir comida!"'
                }
              </CardBody>
              <CardFooter className="mt-4 text-sm text-gray-600">
                — Carla, comensal
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* REGISTRO PARA NEGOCIOS */}
      <section className="py-20 px-6 bg-[#f9e27b] text-center" id="registro">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#003f63] mb-4">
            ¿Eres dueño de un restaurante?
          </h2>
          <p className="mb-6 text-lg text-[#403d39]">
            Si estás interesado en afiliar tu restaurante a Sabor Express,
            regístrate y nos pondremos en contacto contigo.
          </p>
          <Form className="max-w-md mx-auto bg-white p-6 rounded-xl shadow py-2 gap-4 justify-center items-center ">
            <Input
              className="w-full px-1 py-2 rounded-md mt-3"
              placeholder="Nombre del negocio"
              type="text"
            />
            <Input
              className="w-full px-1 py-2 rounded-md"
              placeholder="Correo electrónico"
              type="email"
            />
            <Input
              className="w-full px-1 py-2 rounded-md"
              placeholder="Teléfono"
              type="tel"
            />
            <Button className="w-1/2 bg-[#003f63] text-white py-2 rounded-md font-semibold hover:bg-[#002a45] transition mb-3">
              Registrarme
            </Button>
          </Form>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-20 px-6 bg-[#003f63] text-white text-center"
        id="cta"
      >
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para vender o comer con Sabor Express?
        </h2>
        <p className="mb-6 text-lg">
          Descárgala gratis y únete a la nueva forma de disfrutar la comida con
          tecnología.
        </p>
        <Button
          className="bg-[#f9e27b] text-[#003f63] px-8 py-3 rounded-full font-bold hover:bg-[#ffe168] transition"
          href="#"
        >
          Descargar Ahora
        </Button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 bg-[#f3f1e6] text-gray-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-bold text-lg mb-2">Sabor Express</h4>
            <p className="text-sm">
              Tu app de confianza para vender y comprar comida con estilo.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Navegación</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a className="hover:underline" href="#precios">
                  Precios
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#registro">
                  Registro
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#iniciar">
                  Iniciar sesión
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#cta">
                  Descargar
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Contacto</h4>
            <p className="text-sm">¿Dudas o soporte? Escríbenos a:</p>
            <a
              className="underline text-sm mt-1 block"
              href="mailto:contacto@saborexpress.com"
            >
              contacto@saborexpress.com
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-700 mt-8">
          © 2025 Sabor Express. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
