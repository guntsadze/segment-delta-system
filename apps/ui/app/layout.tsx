import { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Segments Live Data",
  description: "Advanced Customer Segmentation Engine",
  icons: {
    icon: "/ico.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <nav className="bg-white border-b border-slate-200 px-8 py-4 flex gap-8 items-center">
          <Link
            href="/"
            className="hover:text-blue-500 text-xl font-medium color-slate-900"
          >
            მთავარი
          </Link>

          <div className="flex gap-4">
            <Link href="/segments" className="hover:text-blue-500 font-medium">
              სეგმენტები
            </Link>
            <Link
              href="/simulation"
              className="hover:text-blue-500 font-medium"
            >
              სიმულაციები
            </Link>
          </div>
        </nav>
        <main className="p-4">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
