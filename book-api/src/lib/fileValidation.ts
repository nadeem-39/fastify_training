import path from "node:path";
import type { MultipartFile } from "@fastify/multipart";

export const fileValidation = (part: MultipartFile): boolean => {
  const ALLOWED_MIMES = ["image/jpeg", "image/png"] as const;
  const ALLOWED_EXTS = [".jpg", ".jpeg", ".png"] as const;

  const ext = path.extname(part.filename).toLowerCase();

  return (
    ALLOWED_MIMES.includes(part.mimetype as (typeof ALLOWED_MIMES)[number]) &&
    ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])
  );
};
