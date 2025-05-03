import { useState } from "react"; // Removed useEffect as it's not used directly here
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CameraCapture from "@/components/CameraCapture";
import AnalysisResult from "@/components/AnalysisResult";
import { Button } from "@/components/ui/button";
import { analyzeWaterImage } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

const Analysis = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisStarted, setAnalysisStarted] = useState<boolean>(false); // New state to track if analysis has been initiated
  const { toast } = useToast();

  const performAnalysis = async () => {
    // Removed imageData parameter, will use state
    if (!capturedImage) return; // Check if there's an image in state
    setIsLoading(true);
    setAnalysisStarted(true); // Mark analysis as started
    setAnalysisResult("");
    try {
      const base64Data = capturedImage.split(",")[1] || capturedImage; // Use capturedImage from state
      const response = await analyzeWaterImage(base64Data);
      if (response.error) {
        throw new Error(response.error);
      }
      // Keep newlines for AnalysisResult component parsing
      setAnalysisResult(response.text);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult("");
      setAnalysisStarted(false); // Reset if analysis fails before completion
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not analyze the image.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setAnalysisResult(""); // Clear previous results if a new image is captured
    setAnalysisStarted(false); // Reset analysis started state
    // performAnalysis(imageData); // Removed immediate analysis call
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult("");
    setIsLoading(false);
    setAnalysisStarted(false); // Reset analysis started state
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 px-4 max-w-[550px] mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Water Analysis</h1>
        </div>

        {!capturedImage ? (
          <>
            <p className="text-muted-foreground text-center mb-6">
              Capture or upload an image of a water sample for AI analysis.
            </p>
            <CameraCapture onImageCapture={handleImageCapture} />
          </>
        ) : (
          <div className="space-y-6">
            <img
              src={capturedImage}
              alt="Captured water sample"
              className="rounded-lg border w-full"
            />

            {/* Conditionally render AnalysisResult only when analysis has started */}
            {analysisStarted && (
              <AnalysisResult result={analysisResult} isLoading={isLoading} />
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleRetake}
                variant="outline"
                disabled={isLoading}
              >
                Retake Photo
              </Button>
              {/* Add Analyze button */}
              <Button
                onClick={performAnalysis} // Call performAnalysis on click
                disabled={
                  isLoading || !capturedImage || (analysisStarted && !isLoading)
                } // Disable if loading, no image, or analysis already done
              >
                {isLoading
                  ? "Analyzing..."
                  : analysisStarted
                  ? "Analysis Complete"
                  : "Analyze Image"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
