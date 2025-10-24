// src/services/cloudinary.ts
type UploadResult = {
  secure_url: string;
  public_id?: string;
  format?: string;
  thumb_url?: string;
};

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

const normalizeUri = (uri: string) => {
  if (uri.startsWith("file://")) return uri;
  if (uri.startsWith("/")) return "file://" + uri;
  return uri;
};

export const uploadToCloudinary = async (uri: string, options?: { width?: number }): Promise<UploadResult> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing in env");
  }

  const normalized = normalizeUri(uri);
  const filename = normalized.split("/").pop() || `upload_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const mimeType = ext === "png" ? "image/png" : `image/${ext === "jpg" ? "jpeg" : ext}`;

  const form = new FormData();
  // @ts-ignore: React Native FormData file object
  form.append("file", { uri: normalized, name: filename, type: mimeType });
  form.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(url, {
    method: "POST",
    body: form as any,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cloudinary upload failed");
  }

  const data = await res.json();

  const result: UploadResult = {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
  };

  if (options?.width && data.public_id) {
    // Construimos la URL de la miniatura mediante la sintaxis de transformación en la URL pública de Cloudinary.
    // Si el public_id contiene slashes (carpetas), Cloudinary los acepta en la ruta.
    const safePublicId = data.public_id;
    const fmt = data.format || "jpg";
    result.thumb_url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,w_${options.width}/${safePublicId}.${fmt}`;
  }

  return result;
};
