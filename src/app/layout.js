import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ModeToggle from "@/components/ModeToggle";
import ThemeDropdown from "@/components/ThemeDropdown";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "Interview Roadmap",
  description: "A complete interactive roadmap for interviews with code examples, exercises, and interview questions. From variables to design patterns.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <div className="top-controls">
                <div id="top-chatbot-slot" className="top-control-slot" />
                <ThemeDropdown />
                <ModeToggle />
              </div>
              {children}
            </main>
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
