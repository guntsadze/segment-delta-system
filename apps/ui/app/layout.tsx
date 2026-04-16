import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

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
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
