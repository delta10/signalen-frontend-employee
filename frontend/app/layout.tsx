import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signalen",
  description: "Verwerk meldingen snel en efficiënt met Signalen",
};

export default function RootLayout({
  children,
  melding,
}: Readonly<{
  children: React.ReactNode;
  melding: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable}  antialiased`}
      >
        {children}
        {melding}
      </body>
    </html>
  );
}
