import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  getAnalysisHistory,
  AnalysisDocument as DbAnalysisDocument,
} from "@/services/mongodbService";
import { Clock, Camera } from "lucide-react";

interface AnalysisHistoryItem {
  _id: string;
  result: string;
  imageUrl?: string;
  timestamp: string;
  qualityLevel?: "positive" | "warning" | "negative" | "neutral";
}

const AnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const determineQualityLevel = (
    resultText: string
  ): "positive" | "warning" | "negative" | "neutral" => {
    if (!resultText) return "neutral";
    const lowerText = resultText.toLowerCase();
    if (
      lowerText.includes("safe") ||
      lowerText.includes("excellent") ||
      lowerText.includes("good quality")
    )
      return "positive";
    if (
      lowerText.includes("caution") ||
      lowerText.includes("moderate") ||
      lowerText.includes("attention")
    )
      return "warning";
    if (
      lowerText.includes("unsafe") ||
      lowerText.includes("harmful") ||
      lowerText.includes("contaminated")
    )
      return "negative";
    return "neutral";
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data: DbAnalysisDocument[] = await getAnalysisHistory();

        const formattedData: AnalysisHistoryItem[] = data.map((item) => ({
          _id: item._id || String(Date.now() + Math.random()),
          result: item.result || "No result available",
          imageUrl: item.imageData,
          timestamp: String(item.timestamp),
          qualityLevel: determineQualityLevel(item.result),
        }));

        setHistory(formattedData);
      } catch (err) {
        console.error("Failed to fetch analysis history:", err);
        setError("Failed to load analysis history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderQualityBadge = (quality: string | undefined) => {
    let badgeClass =
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    if (quality === "positive")
      badgeClass =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    else if (quality === "warning")
      badgeClass =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    else if (quality === "negative")
      badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    return (
      <Badge className={badgeClass}>
        {quality
          ? quality.charAt(0).toUpperCase() + quality.slice(1)
          : "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 px-4 max-w-[550px] mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Analysis History
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/analysis">
              <Camera className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>No analysis records found.</p>
                <Button asChild className="mt-4">
                  <Link to="/analysis">Create Your First Analysis</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            history.map((item) => (
              <Card key={item._id} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Water Analysis</CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    {renderQualityBadge(item.qualityLevel)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground mb-2">
                    {item.result.split("\n\n")[0] || "No summary available"}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnalysisHistory;
