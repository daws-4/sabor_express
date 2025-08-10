import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.SECRET_KEY;

// --- Helper para verificar el token de Admin ---
async function verifyAdminJWT(token: string) {
  if (!SECRET_KEY) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    return payload as { _id: string; rol: number };
  } catch (error) {
    return null;
  }
}

// --- Helper para verificar el token de Usuario ---
async function verifyUserJWT(token: string) {
  if (!SECRET_KEY) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY),
    );

    return payload as { _id: string; email: string; nombre: string };
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("loginCookie")?.value;
  const userToken = request.cookies.get("userSessionCookie")?.value;

  // --- Caso 1: Hay un token de Administrador ---
  if (adminToken) {
    const adminPayload = await verifyAdminJWT(adminToken);

    if (adminPayload) {
      // Si un admin logueado intenta ir a una página de login o al dashboard de usuario, redirigir a su dashboard
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/admin/login") ||
        pathname.startsWith("/dashboard")
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      // Si un admin con rol < 5 intenta acceder a la gestión de admins, redirigir
      if (
        pathname.startsWith("/admin/dashboard/admin") &&
        adminPayload.rol < 5
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // Si es un admin válido, permitir el acceso a las rutas de admin
      return NextResponse.next();
    } else {
      // Si el token de admin es inválido, borrarlo y redirigir
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );

      response.cookies.delete("loginCookie");

      return response;
    }
  }

  // --- Caso 2: Hay un token de Usuario (y no de admin) ---
  if (userToken) {
    const userPayload = await verifyUserJWT(userToken);

    if (userPayload) {
      // Si un usuario logueado intenta ir a una página de admin o de login, redirigir a su dashboard
      if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Si es un usuario válido, permitir el acceso a las rutas de usuario
      return NextResponse.next();
    } else {
      // Si el token de usuario es inválido, borrarlo y redirigir
      const response = NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete("userSessionCookie");

      return response;
    }
  }

  // --- Caso 3: No hay ningún token (Usuario no logueado) ---
  // Si intenta acceder a cualquier ruta protegida, redirigir a la página de inicio
  if (
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Para cualquier otra ruta (ej. /login, /register), permitir el acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/login",
    "/dashboard/:path*",
    "/login",
  ],
};
