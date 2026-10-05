import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { put } from "@vercel/blob";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart/form-data upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No image file provided." },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid image format. Only JPG, PNG, and WebP are supported." },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: "Image size exceeds 2 MB limit." },
          { status: 400 }
        );
      }

      let avatarUrl = "";

      // If Vercel Blob token is configured, upload to hosted storage
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const ext = file.type.split("/")[1] || "webp";
        const blob = await put(`avatars/${session.userId}-${Date.now()}.${ext}`, file, {
          access: "public",
        });
        avatarUrl = blob.url;
      } else {
        // Fallback for local development: encode as optimized data URL
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        avatarUrl = `data:${file.type};base64,${base64}`;
      }

      await db.updateUser(session.userId, { avatarUrl });

      return NextResponse.json({
        success: true,
        avatarUrl,
      });
    }

    // 2. Handle JSON base64 upload (from client-side canvas crop/compress)
    const body = await req.json().catch(() => ({}));
    const { dataUrl } = body;

    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid image data is required." },
        { status: 400 }
      );
    }

    const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Invalid image data format." },
        { status: 400 }
      );
    }

    const mime = matches[1];
    const base64Data = matches[2];

    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, and WebP are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds 2 MB limit." },
        { status: 400 }
      );
    }

    let avatarUrl = dataUrl;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const ext = mime.split("/")[1] || "webp";
      const blob = await put(`avatars/${session.userId}-${Date.now()}.${ext}`, buffer, {
        access: "public",
        contentType: mime,
      });
      avatarUrl = blob.url;
    }

    await db.updateUser(session.userId, { avatarUrl });

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (err) {
    console.error("[avatar upload error]", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar image." },
      { status: 500 }
    );
  }
}
