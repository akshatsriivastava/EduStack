import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { icons } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "EduStack",
  description:
    "AI Course Generator is a Next.js web app that lets users create and manage personalized coding courses.",
  icons: {
    icon: "/seedofcode_icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        {/* <GoogleOneTap/> */}
        <body className={`${inter.className}`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
