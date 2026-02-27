import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ModeToggle from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "JavaScript Learning Roadmap — Beginner to Advanced",
  description: "A complete interactive JavaScript learning roadmap with code examples, exercises, and interview questions. From variables to design patterns.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <ModeToggle />
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
