import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, BarChart } from 'lucide-react';

const Reports = () => {
  // Mock data for reports
  const recentReports = [
    {
      id: '1',
      date: '2025-04-25',
      location: 'Local Lake',
      quality: 'Good',
      parameters: {
        ph: '7.2',
        turbidity: '2.1 NTU',
        dissolvedOxygen: '8.5 mg/L',
      },
    },
    {
      id: '2',
      date: '2025-04-23',
      location: 'Community Pond',
      quality: 'Fair',
      parameters: {
        ph: '6.8',
        turbidity: '5.3 NTU',
        dissolvedOxygen: '6.2 mg/L',
      },
    },
    {
      id: '3',
      date: '2025-04-20',
      location: 'River Bend',
      quality: 'Poor',
      parameters: {
        ph: '5.9',
        turbidity: '12.7 NTU',
        dissolvedOxygen: '4.1 mg/L',
      },
    },
  ];

  // Function to render quality badge with appropriate color
  const renderQualityBadge = (quality: string) => {
    let badgeClass = '';
    
    switch (quality.toLowerCase()) {
      case 'good':
        badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'fair':
        badgeClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        break;
      case 'poor':
        badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
    
    return <Badge className={badgeClass}>{quality}</Badge>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 px-4 max-w-[550px] mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Water Quality Reports</h1>
          <p className="text-muted-foreground">
            View recent water quality data and historical trends
          </p>
        </div>
        
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span>Recent Reports</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {recentReports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.location}</CardTitle>
                      <CardDescription>
                        {new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    {renderQualityBadge(report.quality)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">pH</p>
                      <p className="font-medium">{report.parameters.ph}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Turbidity</p>
                      <p className="font-medium">{report.parameters.turbidity}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Dissolved O₂</p>
                      <p className="font-medium">{report.parameters.dissolvedOxygen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Water Quality Trends</CardTitle>
                <CardDescription>
                  Historical data for the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <BarChart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Trend analysis will be available after more data is collected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
