
import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm w-full">
      <div className="container py-6 px-4 max-w-[550px]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Droplet className="h-5 w-5 text-primary" />
            <span className="font-medium text-base">Clean Connect</span>
          </div>
          
          <nav className="flex flex-wrap justify-center space-x-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/chat" className="hover:text-primary transition-colors">
              Chat
            </Link>
            <Link to="/analysis" className="hover:text-primary transition-colors">
              Analysis
            </Link>
            <Link to="/reports" className="hover:text-primary transition-colors">
              Reports
            </Link>
          </nav>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>© {new Date().getFullYear()} Clean Connect. All rights reserved.</p>
            <p className="mt-1">Monitoring water quality for a cleaner future.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
