import type { Metadata } from "next";
import "./globals.css";
import "../styles/Navbar.css";
import NavBar from "./components/Navbar";

export const metadata: Metadata = {
  title: "HFit - Home Fitness",
  description: "Here you can get in shape even in the comfort of your home!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Link to the favicon */}
        <link rel="icon" href="/Pics/favicon.ico" />
      </head>
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
