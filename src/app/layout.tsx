import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Hub — Teams-connected CRM, dialer & video",
  description: "A custom CRM with Microsoft Teams messaging, click-to-dial and video rooms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}