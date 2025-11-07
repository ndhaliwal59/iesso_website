import { Link, useLocation } from "wouter";
import { Activity } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer">
              <Activity className="w-8 h-8 text-cyan-400" />
              <span className="text-xl md:text-2xl font-semibold text-foreground">
                Ontario Energy Forecast
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 md:gap-8">
            <Link href="/" data-testid="link-analytics">
              <span
                className={`text-sm md:text-base font-medium cursor-pointer transition-colors ${
                  location === "/"
                    ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Analytics
              </span>
            </Link>
            <Link href="/about" data-testid="link-about">
              <span
                className={`text-sm md:text-base font-medium cursor-pointer transition-colors ${
                  location === "/about"
                    ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                About
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
