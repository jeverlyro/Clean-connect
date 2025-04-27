
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Droplet, MessageCircle, Camera, Chart } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: 'AI Chatbot',
      description: 'Ask questions about water quality and get expert answers instantly.',
      link: '/chat',
      linkText: 'Start Chatting',
    },
    {
      icon: <Camera className="h-10 w-10 text-primary" />,
      title: 'Water Analysis',
      description: 'Take a photo of water samples and receive detailed quality analysis.',
      link: '/analysis',
      linkText: 'Analyze Water',
    },
    {
      icon: <Chart className="h-10 w-10 text-primary" />,
      title: 'Reports',
      description: 'View historical data and reports on water quality in your area.',
      link: '/reports',
      linkText: 'View Reports',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-water-light via-background to-aqua-light pt-10 pb-16 px-4">
          <div className="max-w-[550px] mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Droplet className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Clean Connect
            </h1>
            <p className="text-lg text-muted-foreground max-w-[400px] mx-auto">
              Monitor and report water quality in your community for a cleaner, healthier environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg">
                <Link to="/analysis">Analyze Water</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/chat">Ask Questions</Link>
              </Button>
            </div>
          </div>
          
          {/* Wave effect */}
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
            <svg
              className="w-full h-full text-background"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="fill-current"
              ></path>
            </svg>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 px-4">
          <div className="max-w-[550px] mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8">Features</h2>
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-medium">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                      <Button asChild className="mt-2">
                        <Link to={feature.link}>{feature.linkText}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Info Section */}
        <section className="py-12 px-4 bg-muted/50">
          <div className="max-w-[550px] mx-auto text-center space-y-6">
            <h2 className="text-2xl font-semibold">Why Monitor Water Quality?</h2>
            <p className="text-muted-foreground">
              Water quality monitoring is essential for protecting public health, preserving ecosystems, and ensuring sustainable water resources for future generations.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Public Health</h3>
                <p className="text-sm text-muted-foreground">Prevents illness from contaminated water sources</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Environment</h3>
                <p className="text-sm text-muted-foreground">Protects aquatic life and ecosystems</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Sustainability</h3>
                <p className="text-sm text-muted-foreground">Ensures water resources for future needs</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Empowers citizens with knowledge</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
