import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const uploadsDir = path.join(process.cwd(), "uploads");

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件！"));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

export interface StoredUpload {
  url: string;
  key: string;
  provider: "vercel-blob" | "local";
}

async function persistToLocalFilesystem(file: Express.Multer.File): Promise<StoredUpload> {
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const extension = path.extname(file.originalname) || ".png";
  const filename = `${file.fieldname}-${Date.now()}-${nanoid(6)}${extension}`;
  const targetPath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(targetPath, file.buffer);
  return {
    url: `/uploads/${filename}`,
    key: filename,
    provider: "local",
  };
}

async function persistToVercelBlob(file: Express.Multer.File): Promise<StoredUpload> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required when using Vercel Blob storage");
  }

  const extension = path.extname(file.originalname) || ".png";
  const blobKey = `uploads/${Date.now()}-${nanoid(8)}${extension}`;

  const { url } = await put(blobKey, file.buffer, {
    access: "public",
    token,
    contentType: file.mimetype,
  });

  return {
    url,
    key: blobKey,
    provider: "vercel-blob",
  };
}

export async function persistUploadedImage(file: Express.Multer.File | undefined | null): Promise<StoredUpload | null> {
  if (!file) {
    return null;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL === "1") {
    return await persistToVercelBlob(file);
  }

  return await persistToLocalFilesystem(file);
}
