import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

// Validated separately from the main env schema since these are only
// needed by upload-related routes, not the whole app.
const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsed = cloudinaryEnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid Cloudinary configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

cloudinary.config({
  cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME,
  api_key: parsed.data.CLOUDINARY_API_KEY,
  api_secret: parsed.data.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
