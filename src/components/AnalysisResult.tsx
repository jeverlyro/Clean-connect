
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Format the result with some basic parsing
  // In a real app, we'd have more structured data from the API
  const resultSections = result.split('\n\n').filter(Boolean);
  const summary = resultSections[0] || '';
  
  // Extract potential water quality keywords from the result
  const qualityKeywords = [
    { term: 'clear', type: 'positive' },
    { term: 'clean', type: 'positive' },
    { term: 'pure', type: 'positive' },
    { term: 'healthy', type: 'positive' },
    { term: 'safe', type: 'positive' },
    { term: 'transparent', type: 'positive' },
    { term: 'cloudy', type: 'warning' },
    { term: 'turbid', type: 'warning' },
    { term: 'algae', type: 'warning' },
    { term: 'debris', type: 'warning' },
    { term: 'particles', type: 'warning' },
    { term: 'sediment', type: 'warning' },
    { term: 'discolored', type: 'warning' },
    { term: 'polluted', type: 'negative' },
    { term: 'contaminated', type: 'negative' },
    { term: 'toxic', type: 'negative' },
    { term: 'harmful', type: 'negative' },
    { term: 'bacteria', type: 'negative' },
    { term: 'unsafe', type: 'negative' },
  ];
  
  const foundKeywords = qualityKeywords.filter(
    keyword => result.toLowerCase().includes(keyword.term.toLowerCase())
  );

  // Determine a simple quality assessment based on keywords
  let qualityLevel = 'neutral';
  if (foundKeywords.some(k => k.type === 'negative')) {
    qualityLevel = 'negative';
  } else if (foundKeywords.some(k => k.type === 'warning') && 
            !foundKeywords.some(k => k.type === 'positive')) {
    qualityLevel = 'warning';
  } else if (foundKeywords.some(k => k.type === 'positive') && 
            !foundKeywords.some(k => k.type === 'warning') && 
            !foundKeywords.some(k => k.type === 'negative')) {
    qualityLevel = 'positive';
  }

  // Map quality level to badge colors
  const qualityBadgeColors = {
    positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  // Map keyword types to badge colors
  const keywordBadgeColors = {
    positive: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
    negative: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Water Analysis Results</CardTitle>
          {qualityLevel && (
            <Badge className={qualityBadgeColors[qualityLevel as keyof typeof qualityBadgeColors]}>
              {qualityLevel === 'positive' ? 'Good Quality' : 
               qualityLevel === 'warning' ? 'Fair Quality' :
               qualityLevel === 'negative' ? 'Poor Quality' : 'Unknown'}
            </Badge>
          )}
        </div>
        <CardDescription>
          Based on image analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Summary</h3>
            <p className="text-sm text-muted-foreground">
              {summary}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Detailed Analysis</h3>
            <div className="whitespace-pre-wrap text-sm">
              {resultSections.slice(1).join('\n\n')}
            </div>
          </div>
          
          {foundKeywords.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Detected Characteristics</h3>
                <div className="flex flex-wrap gap-2">
                  {foundKeywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className={keywordBadgeColors[keyword.type as keyof typeof keywordBadgeColors]}
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
