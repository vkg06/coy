import "./globals.css";

export const metadata = {
  title: "Coy · Discover",
  description: "Swipe-based discovery with privacy-preserving mutual matching",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
