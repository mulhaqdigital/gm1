import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LoginDialogProvider } from "@/components/auth/LoginDialogProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GM1",
  description: "Groups, Pages, People",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <LoginDialogProvider>
          {children}
          <Toaster />
        </LoginDialogProvider>
      </body>
    </html>
  );
}
