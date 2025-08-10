import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("loginCookie");
    const userToken = cookieStore.get("userSessionCookie");

    // Check if the user is logged out already
    if (!adminToken && !userToken) {
      return NextResponse.json(
        { message: "User is not logged in" },
        { status: 401 },
      );
    }

    // Delete the cookies if they exist
    if (adminToken) {
      cookieStore.delete("loginCookie");
    }
    if (userToken) {
      cookieStore.delete("userSessionCookie");
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Logout error:", error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
