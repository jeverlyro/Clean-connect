import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AnalysisResultProps {
  result: string;
  isLoading: boolean;
}

const AnalysisResult = ({ result, isLoading }: AnalysisResultProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />

          <Separator className="my-4" />

          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  // Check if the image is not related to water
  const waterRelatedTerms = [
    "water",
    "aqua",
    "hydro",
    "liquid",
    "pool",
    "lake",
    "river",
    "stream",
    "ocean",
    "sea",
    "pond",
    "puddle",
    "rain",
    "h2o",
    "moisture",
    "wet",
    "fluid",
  ];

  // Non-water related response indicators
  const nonWaterIndicators = [
    "not water",
    "not a water",
    "unrelated to water",
    "cannot analyze",
    "not related to water",
    "doesn't appear to be water",
    "doesn't show water",
    "not showing water",
    "non-water",
  ];

  const resultLower = result.toLowerCase();
  const isWaterRelated = waterRelatedTerms.some((term) =>
    resultLower.includes(term.toLowerCase())
  );
  const isExplicitlyNotWater = nonWaterIndicators.some((indicator) =>
    resultLower.includes(indicator.toLowerCase())
  );

  if (!isWaterRelated || isExplicitlyNotWater) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invalid Image</CardTitle>
          <CardDescription>
            This doesn't appear to be a water sample
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The image doesn't appear to contain a water sample that can be
              analyzed. Please upload an image clearly showing water to get a
              proper analysis.
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>For best results, please ensure your image:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Shows a clear view of water</li>
              <li>Has good lighting</li>
              <li>Is in focus and not blurry</li>
              <li>Shows the water's natural color</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format the result with some basic parsing
  // In a real app, we'd have more structured data from the API
  const resultSections = result.split("\n\n").filter(Boolean);
  const summary = resultSections[0] || "";

  // Extract potential water quality keywords from the result
  const qualityKeywords = [
    { term: "clear", type: "positive" },
    { term: "clean", type: "positive" },
    { term: "pure", type: "positive" },
    { term: "healthy", type: "positive" },
    { term: "safe", type: "positive" },
    { term: "transparent", type: "positive" },
    { term: "cloudy", type: "warning" },
    { term: "turbid", type: "warning" },
    { term: "algae", type: "warning" },
    { term: "debris", type: "warning" },
    { term: "particles", type: "warning" },
    { term: "sediment", type: "warning" },
    { term: "discolored", type: "warning" },
    { term: "polluted", type: "negative" },
    { term: "contaminated", type: "negative" },
    { term: "toxic", type: "negative" },
    { term: "harmful", type: "negative" },
    { term: "bacteria", type: "negative" },
    { term: "unsafe", type: "negative" },
  ];

  const foundKeywords = qualityKeywords.filter((keyword) =>
    result.toLowerCase().includes(keyword.term.toLowerCase())
  );

  // Determine a simple quality assessment based on keywords
  let qualityLevel = "neutral";
  if (foundKeywords.some((k) => k.type === "negative")) {
    qualityLevel = "negative";
  } else if (
    foundKeywords.some((k) => k.type === "warning") &&
    !foundKeywords.some((k) => k.type === "positive")
  ) {
    qualityLevel = "warning";
  } else if (
    foundKeywords.some((k) => k.type === "positive") &&
    !foundKeywords.some((k) => k.type === "warning") &&
    !foundKeywords.some((k) => k.type === "negative")
  ) {
    qualityLevel = "positive";
  }

  // Map quality level to badge colors
  const qualityBadgeColors = {
    positive:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  // Map keyword types to badge colors
  const keywordBadgeColors = {
    positive:
      "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
    negative:
      "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Card className="border bg-card">
      <CardHeader>
        <CardTitle>Water Analysis Results</CardTitle>
        <CardDescription>
          AI-powered analysis of your water sample
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className="text-sm text-card-foreground"
            dangerouslySetInnerHTML={{ __html: result }}
          />

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">Detailed Analysis</h3>
            <div className="whitespace-pre-wrap text-sm">
              {resultSections.slice(1).join("\n\n")}
            </div>
          </div>

          {foundKeywords.length > 0 && (
            <>
              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Detected Characteristics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {foundKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={
                        keywordBadgeColors[
                          keyword.type as keyof typeof keywordBadgeColors
                        ]
                      }
                    >
                      {keyword.term}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;
