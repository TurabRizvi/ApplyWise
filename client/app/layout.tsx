import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { HrAuthProvider } from "@/lib/hr-auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ApplyWise — AI-Powered Resumes & Hiring",
  description:
    "Build ATS-friendly resumes with AI, prep for interviews, and track applications. Recruiters screen and rank candidates in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <HrAuthProvider>{children}</HrAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
