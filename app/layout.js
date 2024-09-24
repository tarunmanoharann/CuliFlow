import "./globals.css";

export const metadata = {
  title: "DWLR - Digital Water Level Record",
  description: "Monitoring water levels around the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
