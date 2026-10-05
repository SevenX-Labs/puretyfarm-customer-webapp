"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiCamera, FiUpload, FiTrash2, FiCheck, FiX, FiZoomIn } from "react-icons/fi";

interface AvatarUploadProps {
  initialUrl?: string;
  name?: string;
  onUploaded: (url: string) => void;
  onError?: (msg: string) => void;
  className?: string;
}

export function AvatarUpload({
  initialUrl,
  name = "",
  onUploaded,
  onError,
  className = "",
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialUrl || "");
  const [prevInitialUrl, setPrevInitialUrl] = useState<string | undefined>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  // Crop / Canvas state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  if (initialUrl !== prevInitialUrl) {
    setPrevInitialUrl(initialUrl);
    setAvatarUrl(initialUrl || "");
  }

  // Compute initials fallback
  const getInitials = (text: string) => {
    if (!text.trim()) return "PF";
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if needed
    e.target.value = "";

    // 1. Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      onError?.("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    // 2. Validate max 2 MB
    if (file.size > 2 * 1024 * 1024) {
      onError?.("Image size must be 2 MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const src = loadEvt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        setImageSrc(src);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Render crop preview on canvas
  const drawCropPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Calculate scaling to cover the square canvas
    const baseScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const currentScale = baseScale * zoom;

    const drawW = img.naturalWidth * currentScale;
    const drawH = img.naturalHeight * currentScale;

    // Center image + apply user pan
    const centerX = (size - drawW) / 2 + pan.x;
    const centerY = (size - drawH) / 2 + pan.y;

    ctx.drawImage(img, centerX, centerY, drawW, drawH);
  }, [zoom, pan]);

  useEffect(() => {
    if (showCropModal) {
      drawCropPreview();
    }
  }, [showCropModal, drawCropPreview]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Perform square crop, client-side resize & compression to <= 512x512
  const handleApplyCropAndUpload = async () => {
    const previewCanvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!previewCanvas || !img) return;

    setShowCropModal(false);
    setUploading(true);

    try {
      const outputSize = 512;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = outputSize;
      exportCanvas.height = outputSize;
      const ctx = exportCanvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize canvas context.");

      const previewSize = previewCanvas.width;
      const ratio = outputSize / previewSize;

      const baseScale = Math.max(previewSize / img.naturalWidth, previewSize / img.naturalHeight);
      const currentScale = baseScale * zoom;

      const drawW = img.naturalWidth * currentScale * ratio;
      const drawH = img.naturalHeight * currentScale * ratio;
      const drawX = ((previewSize - img.naturalWidth * currentScale) / 2 + pan.x) * ratio;
      const drawY = ((previewSize - img.naturalHeight * currentScale) / 2 + pan.y) * ratio;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Convert to blob with compression (WebP preferred, fallback to JPEG)
      const blob = await new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob(
          (b) => resolve(b),
          "image/webp",
          0.85
        );
      });

      if (!blob) throw new Error("Failed to compress image.");

      const formData = new FormData();
      formData.append("file", blob, `avatar_${Date.now()}.webp`);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      setAvatarUrl(data.url);
      onUploaded(data.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error uploading avatar";
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    onUploaded("");
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-5 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        aria-label="Upload profile image"
      />

      {/* Avatar Container */}
      <div className="relative group shrink-0">
        <div
          className={`
            w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#E8DFD4] 
            overflow-hidden shadow-sm flex items-center justify-center
            bg-gradient-to-br from-[#FAF3EA] to-[#F3E7D7] transition-all
            ${uploading ? "opacity-60" : "group-hover:border-[#5C1B13]"}
          `}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name || "Profile avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#5C1B13]">
              <span className="text-2xl sm:text-3xl font-serif font-bold tracking-wider">
                {getInitials(name)}
              </span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#5C1B13] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Quick action button overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5C1B13] text-white flex items-center justify-center shadow-md hover:bg-[#40110D] active:scale-95 transition-all cursor-pointer"
          title="Change profile photo"
          aria-label="Change profile photo"
        >
          <FiCamera className="w-4 h-4" />
        </button>
      </div>

      {/* Info & action buttons */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
        <div>
          <h4 className="text-sm font-bold text-[#1A1008]">Profile Picture</h4>
          <p className="text-[11px] text-[#3A241C]/65">
            JPG, PNG or WebP · Max 2 MB · Square auto-cropped
          </p>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD4] hover:border-[#5C1B13]/40 text-xs font-semibold text-[#1A1008] hover:text-[#5C1B13] transition-colors shadow-2xs cursor-pointer"
          >
            <FiUpload className="w-3.5 h-3.5" />
            <span>{avatarUrl ? "Replace Photo" : "Upload Photo"}</span>
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={uploading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── SQUARE CROP MODAL ─── */}
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4]">
              <div>
                <h3 className="text-base font-bold text-[#1A1008]">Crop Profile Photo</h3>
                <p className="text-xs text-[#3A241C]/60">Drag to center and use slider to zoom</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Canvas Viewport */}
            <div className="flex justify-center">
              <div
                className="w-[260px] h-[260px] rounded-2xl overflow-hidden border-2 border-dashed border-[#5C1B13]/40 bg-black/5 relative cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <canvas
                  ref={canvasRef}
                  width={260}
                  height={260}
                  className="w-full h-full block"
                />
                {/* Circular mask guide */}
                <div className="absolute inset-0 rounded-full border-2 border-white/60 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#3A241C]/70 font-medium">
                <span className="flex items-center gap-1">
                  <FiZoomIn className="w-3.5 h-3.5 text-[#5C1B13]" />
                  <span>Zoom</span>
                </span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#5C1B13] cursor-pointer"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyCropAndUpload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#5C1B13] hover:bg-[#40110D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#5C1B13]/20 cursor-pointer"
              >
                <FiCheck className="w-4 h-4" />
                <span>Crop & Save</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#FAF3EA] hover:bg-[#F3E7D7] text-[#1A1008] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
