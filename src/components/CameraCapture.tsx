
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Image } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

const CameraCapture = ({ onCapture }: CameraCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access the camera. Please ensure camera permissions are enabled.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    onCapture(imageDataUrl);
    
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
      onCapture(imageDataUrl);
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
