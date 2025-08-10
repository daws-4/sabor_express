"use client";

import React from "react";
import { Button, Card, CardBody, Link } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function TerminosYCondicionesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full mx-auto shadow-lg">
        <CardBody className="p-6 md:p-10 text-gray-700">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Términos y Condiciones de Servicio
            </h1>
            <p className="text-gray-500 mt-2">
              Última actualización: 19 de Julio de 2025
            </p>
          </header>

          <div className="space-y-6 text-base leading-relaxed">
            <p>
              Bienvenido a <strong>Miche Claro</strong>. Antes de utilizar
              nuestros servicios, te pedimos que leas detenidamente los
              siguientes términos y condiciones. Al registrarte o utilizar
              nuestra plataforma, confirmas que has leído, entendido y aceptado
              estar sujeto a estos términos.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                1. Descripción del Servicio
              </h2>
              <p>
                <strong>Miche Claro</strong>{" "}
                {
                  'es una plataforma online que actúa como intermediario para conectar a vendedores de mercancía  "Vendedores" con clientes "Consumidores". Nuestro servicio está enfocado principalmente en la comercialización de productos de consumo, incluyendo, pero no limitándose a,'
                }{" "}
                <strong>bebidas alcohólicas</strong> y productos relacionados.
                La plataforma permite a los Vendedores gestionar su catálogo de
                productos y recibir pedidos online para optimizar y digitalizar
                su negocio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                2. Proceso de Registro y Cuota de Afiliación
              </h2>
              <p>
                Para registrarse como Vendedor en nuestra plataforma, es
                necesario completar un proceso de verificación. Este proceso
                conlleva una{" "}
                <strong>
                  cuota única de afiliación de cincuenta dólares estadounidenses
                  ($50.00 USD)
                </strong>
                .
              </p>
              <ul className="list-disc list-inside mt-2 pl-4 space-y-1">
                <li>
                  Esta cuota cubre los costos administrativos y de verificación
                  inicial.
                </li>
                <li>
                  El pago de la cuota no garantiza la aprobación. Todos los
                  perfiles están sujetos a un proceso de revisión.
                </li>
                <li>
                  Una vez enviada tu solicitud de registro, nuestro equipo
                  técnico se pondrá en contacto contigo para guiarte en el
                  proceso de pago y los siguientes pasos para la activación de
                  tu cuenta.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                3. Transacciones Financieras
              </h2>
              <p className="font-bold text-red-600">
                Miche Claro NO procesa, gestiona ni interviene en las
                transacciones financieras directas entre Vendedores y
                Consumidores.
              </p>
              <p className="mt-2">
                Nuestra plataforma facilita la comunicación y la gestión de
                pedidos, pero no actúa como una pasarela de pago para las
                transacciones de productos. La responsabilidad de cobrar y
                procesar los pagos recae exclusivamente en el Vendedor. Miche
                Claro no se hace responsable de disputas, fraudes o cualquier
                otro problema relacionado con los pagos entre las partes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                4. Funcionalidades Adicionales: Juegos
              </h2>
              <p>
                Además de los servicios de venta online, la aplicación incluye
                un apartado de juegos y entretenimiento. El propósito de estas
                funcionalidades es mejorar la experiencia del usuario y atraer a
                una mayor comunidad a la plataforma, beneficiando así la
                visibilidad de los Vendedores registrados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                5. Contacto y Soporte
              </h2>
              <p>
                Si tienes alguna pregunta sobre el proceso de registro, el pago
                de la cuota de afiliación o cualquier otro aspecto de nuestros
                servicios, no dudes en contactar a nuestro equipo técnico.
              </p>
              <div className="mt-2">
                <p>
                  <strong>Correo Electrónico:</strong>{" "}
                  <Link
                    className="text-blue-600 hover:underline"
                    href="mailto:soporte@micheclaro.com"
                  >
                    soporte@micheclaro.com
                  </Link>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{" "}
                  <Link
                    className="text-blue-600 hover:underline"
                    href="https://wa.me/1234567890"
                    target="_blank"
                  >
                    +1 (234) 567-890
                  </Link>
                </p>
              </div>
            </section>

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="font-semibold">
                {
                  '    Al hacer clic en "Aceptar y Volver al Registro" o al continuar utilizando nuestros servicios, confirmas tu total aceptación de estos Términos y Condiciones.'
                }
              </p>
            </div>
          </div>

          <footer className="mt-8 pt-6 border-t text-center">
            <Button
              className="bg-[#007D8A] text-white w-full md:w-auto"
              onPress={() => router.back()} // Vuelve a la página anterior (el formulario de registro)
            >
              Aceptar y Volver al Registro
            </Button>
          </footer>
        </CardBody>
      </Card>
    </div>
  );
}
