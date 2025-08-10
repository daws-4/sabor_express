import { NextResponse, NextRequest } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// POST: Genera una URL firmada para leer un archivo
export async function POST(req: NextRequest) {
  try {
    const { fileKey } = await req.json();

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: "Falta el fileKey." },
        { status: 400 },
      );
    }

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      }),
      { expiresIn: 3600 }, // La URL es válida por 1 hora
    );

    return NextResponse.json({ success: true, url: signedUrl });
  } catch (error) {
    console.error("Error generando URL firmada de lectura:", error);

    return NextResponse.json(
      { success: false, error: "Error al generar la URL." },
      { status: 500 },
    );
  }
}
