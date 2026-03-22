import type { Metadata } from 'next';

import './globals.css';

import { ProviderMain } from '@/components/provider/provider-main';
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'LinkedIn Post - Dashboard',
  description: 'Manage and publish LinkedIn articles',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning className={cn("font-mono", jetbrainsMono.variable)}
    >
      <ProviderMain>{children}</ProviderMain>
    </html>
  );
}
