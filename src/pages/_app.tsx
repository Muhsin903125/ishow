import type { AppProps } from 'next/app'
import { Manrope } from "next/font/google";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardRoleForPath } from "@/lib/navigation";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLandingPage = router.pathname === "/";
  const shellClass = isLandingPage ? "app-light landing-page" : "app-light";

  return (
    <div className={`${manrope.className} ${manrope.variable} ${shellClass} h-full font-sans`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <AuthProvider>
          <TooltipProvider>
            <AppContent Component={Component} pageProps={pageProps} />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

type AppContentProps = Pick<AppProps, "Component" | "pageProps">;

function AppContent({ Component, pageProps }: AppContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const role = getDashboardRoleForPath(router.pathname, user?.role ?? null);

  if (!role) {
    return <Component {...pageProps} />;
  }

  return (
    <DashboardLayout role={role}>
      <Component {...pageProps} />
    </DashboardLayout>
  );
}
