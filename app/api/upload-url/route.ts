import crypto from "crypto";

import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// POST: Genera una URL firmada para subir un archivo
export async function POST(req: NextRequest) {
  try {
    const { fileType } = await req.json();
    const fileName = generateFileName();

    const signedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: fileType,
      }),
      { expiresIn: 60 },
    );

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl,
      imageUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
    });
  } catch (error) {
    console.error("Error generando URL firmada:", error);

    return NextResponse.json(
      { success: false, error: "Error al generar la URL de subida." },
      { status: 500 },
    );
  }
}

// DELETE: Elimina un objeto de S3
export async function DELETE(req: NextRequest) {
  try {
    const { fileKey } = await req.json(); // El 'Key' es el nombre del archivo en S3

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: "Falta el fileKey." },
        { status: 400 },
      );
    }

    await s3.send(
      new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando objeto de S3:", error);

    return NextResponse.json(
      { success: false, error: "Error al eliminar la imagen." },
      { status: 500 },
    );
  }
}
