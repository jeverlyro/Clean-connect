import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Image } from "lucide-react";

export interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void;
}

const CameraCapture = ({ onImageCapture }: CameraCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media Devices API not supported in your browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video starts playing
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }

      setIsCapturing(true);
    } catch (error) {
      console.error("Error accessing camera:", error);

      // More specific error messages
      if ((error as Error).name === "NotAllowedError") {
        alert(
          "Camera access was denied. Please enable camera permissions in your browser settings."
        );
      } else if ((error as Error).name === "NotFoundError") {
        alert("No camera detected on your device.");
      } else {
        alert("Could not access the camera: " + (error as Error).message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    // Try to capture at a reasonable resolution
    const canvas = document.createElement("canvas");
    // Don't make the image too large - this could cause API issues
    const MAX_DIMENSION = 800;
    let width = videoRef.current.videoWidth;
    let height = videoRef.current.videoHeight;

    // Resize if necessary while maintaining aspect ratio
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = (height / width) * MAX_DIMENSION;
        width = MAX_DIMENSION;
      } else {
        width = (width / height) * MAX_DIMENSION;
        height = MAX_DIMENSION;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Use a reasonable quality for JPEG (0.85 is a good balance)
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imageDataUrl);
    onImageCapture(imageDataUrl);

    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 4 * 1024 * 1024) {
      // 4MB limit
      alert("Image is too large. Please choose an image under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setCapturedImage(imageDataUrl);
      onImageCapture(imageDataUrl);

      // Log info about the uploaded image
      console.log("Uploaded image type:", file.type);
      console.log("Uploaded image size:", file.size, "bytes");
      console.log("Image data URL prefix:", imageDataUrl.substring(0, 30));
    };

    reader.readAsDataURL(file);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted p-2 text-sm font-medium flex justify-between items-center">
        <span>Water Sample Image</span>
        {!isCapturing && !capturedImage && (
          <label className="cursor-pointer flex items-center gap-1 text-sm hover:text-primary transition-colors">
            <Image className="h-4 w-4" />
            <span>Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      <div className="aspect-video relative bg-black">
        {isCapturing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured water sample"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <Camera className="h-12 w-12 mb-2 opacity-60" />
            <p className="text-sm opacity-60">No image captured</p>
          </div>
        )}
      </div>

      <div className="p-3 flex justify-between">
        {isCapturing ? (
          <>
            <Button variant="outline" size="sm" onClick={stopCamera}>
              Cancel
            </Button>
            <Button size="sm" onClick={captureImage}>
              Take Photo
            </Button>
          </>
        ) : capturedImage ? (
          <>
            <Button variant="outline" size="sm" onClick={retakePhoto}>
              Retake
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 pointer-events-none"
            >
              Placeholder
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 pointer-events-none"
            >
              Placeholder
            </Button>
            <Button size="sm" onClick={startCamera}>
              Open Camera
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default CameraCapture;
