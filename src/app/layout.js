import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ModeToggle from "@/components/ModeToggle";
import ThemeDropdown from "@/components/ThemeDropdown";
import AuthButton from "@/components/AuthButton";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Interview Roadmap",
  description:
    "A complete interactive roadmap for interviews with code examples, exercises, and interview questions. From variables to design patterns.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <div className="top-controls">
                  <div id="top-chatbot-slot" className="top-control-slot" />
                  <ThemeDropdown />
                  <ModeToggle />
                  <AuthButton />
                </div>
                {children}
              </main>
            </div>
          </ThemeProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
