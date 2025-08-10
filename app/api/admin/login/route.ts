import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import administradores from "@/models/administradores";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

export async function POST(request: Request) {
  await connectDB(); // Ensure the database connection is established
  const data = await request.json();

  console.log(data);
  const admins = await administradores.findOne({ username: data.username });

  console.log(admins);
  if (!admins) {
    return NextResponse.json({ message: "Usuario no existe" }, { status: 400 });
  }
  const comparePassword = await bcrypt.compare(data.password, admins.password);

  if (admins.length == 0 || !comparePassword) {
    return NextResponse.json(
      {
        message: "Usuario o contraseña Incorrectos",
      },
      {
        status: 401,
      },
    );
  }
  // **Replace with your actual authentication logic (e.g., database check)**
  if (data.username === admins.username && comparePassword) {
    // Create JWT token
    const token = sign(
      {
        _id: admins._id,
        username: admins.username,
        rol: admins.rol,
        estado: admins.estado,
      },
      SECRET_KEY,
    );

    // Set the cookie using next/headers
    const cookieStore = await cookies();

    cookieStore.set("loginCookie", token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json(
      { message: "Authentication successful!" },
      {
        status: 200,
      },
    );
  } else {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }
}
