import { cloudinary } from "../config/cloudinary";
import { AppError } from "./AppError";

// Streams a buffer straight to Cloudinary without touching disk.
// `resource_type: raw` is used because this is a PDF, not an image —
// Cloudinary treats non-image files differently and this avoids it trying
// (and failing) to generate image transformations for a PDF.
export function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder },
      (error, result) => {
        if (error || !result) {
          return reject(new AppError("Failed to upload file to storage", 502));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}
