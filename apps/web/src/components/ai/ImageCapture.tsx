import { useRef, useState } from "react";
import { Upload, Camera, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ImageCapture({ onImageReady }: { onImageReady: (file: File, previewUrl: string) => void }) {
  const [mode, setMode] = useState<"idle" | "camera">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageReady(file, url);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setMode("camera");
      // video element mounts on next render; attach once it exists
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCameraError("Could not access your camera. Check that you've granted camera permission, or upload a photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("idle");
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        handleFile(file);
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  }

  function reset() {
    setPreviewUrl(null);
    stopCamera();
  }

  if (previewUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <img src={previewUrl} alt="Selected plant" className="max-h-80 rounded-2xl border border-[color:var(--color-border)] object-contain" />
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw size={14} /> Choose a different photo
        </Button>
      </div>
    );
  }

  if (mode === "camera") {
    return (
      <div className="flex flex-col items-center gap-3">
        <video ref={videoRef} autoPlay playsInline className="max-h-80 rounded-2xl border border-[color:var(--color-border)] bg-black" />
        <div className="flex gap-2">
          <Button onClick={capturePhoto}>
            <Camera size={16} /> Capture
          </Button>
          <Button variant="outline" onClick={stopCamera}>
            <X size={16} /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-[color:var(--color-border)] rounded-2xl p-10">
      <Upload size={32} className="text-[color:var(--color-forest-400)]" />
      <p className="text-sm text-[color:var(--color-ink-muted)] text-center">Upload a clear photo of the plant, or use your camera.</p>
      {cameraError ? <p className="text-xs text-[color:var(--color-danger)]">{cameraError}</p> : null}
      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> Upload Photo
        </Button>
        <Button variant="outline" onClick={startCamera}>
          <Camera size={16} /> Use Camera
        </Button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileInputChange} />
    </div>
  );
}
