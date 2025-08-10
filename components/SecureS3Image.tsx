"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface SecureS3ImageProps {
  s3Url: string;
  alt: string;
  className?: string;
}

export const SecureS3Image: React.FC<SecureS3ImageProps> = ({
  s3Url,
  alt,
  className,
}) => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (!s3Url) {
        setIsLoading(false);

        return;
      }

      try {
        // Extraemos el 'key' de la URL completa de S3
        const fileKey = s3Url.split("/").pop();

        const { data } = await axios.post("/api/get-image-url", { fileKey });

        if (data.success) {
          setPresignedUrl(data.url);
        }
      } catch (error) {
        console.error("Error al obtener la URL firmada:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresignedUrl();
  }, [s3Url]); // Se ejecuta cada vez que la URL de S3 cambia

  if (isLoading) {
    // Muestra un placeholder mientras carga
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded-t-xl`} />
    );
  }

  if (!presignedUrl) {
    // Muestra una imagen de fallback si falla
    return (
      <img
        alt={alt}
        className={className}
        src={"https://placehold.co/600x400/EEE/31343C?text=Error"}
      />
    );
  }

  return <img alt={alt} className={className} src={presignedUrl} />;
};
