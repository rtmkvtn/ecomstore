import React from "react";
import Header from "@/components/shared/header";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 wrapper">
        {children}root
      </main>
    </div>
  );
}
