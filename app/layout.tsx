import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import { Roboto } from "next/font/google";
import AuthProvider from "@/components/AuthProvider/AuthProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Note Hub",
  description: "Created by GoIT",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <TanStackProvider>
          <AuthProvider>
            {/* <-- додаємо провайдер */}
            <Header />
            <main>
              {children}
              {modal}
            </main>
            <footer>
              <p>
                Created <time dateTime="2025">2025</time>
              </p>
            </footer>
          </AuthProvider>
          {/* <-- додаємо провайдер */}
        </TanStackProvider>
      </body>
    </html>
  );
}
