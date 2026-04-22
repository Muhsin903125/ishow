import type { AppProps } from 'next/app'
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} h-full`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <TooltipProvider>
            <Component {...pageProps} />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}
