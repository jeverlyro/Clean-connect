
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CameraCapture from '@/components/CameraCapture';
import AnalysisResult from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { analyzeWaterImage } from '@/services/geminiService';
import { Droplet } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';

const Analysis = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setAnalysisResult('');
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast.error('Please capture or upload an image first.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeWaterImage(capturedImage);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setAnalysisResult(result.text);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 px-4 max-w-[550px] mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Water Analysis</h1>
          <p className="text-muted-foreground">
            Capture or upload an image of water to analyze its quality.
          </p>
        </div>
        
        <div className="space-y-6">
          <CameraCapture onCapture={handleImageCapture} />
          
          {capturedImage && (
            <div className="flex justify-center">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full max-w-xs"
              >
                {isAnalyzing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Droplet className="mr-2 h-4 w-4" />
                    Analyze Water Sample
                  </>
                )}
              </Button>
            </div>
          )}
          
          {(isAnalyzing || analysisResult) && (
            <AnalysisResult result={analysisResult} isLoading={isAnalyzing} />
          )}
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Analysis;
