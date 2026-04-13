import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <main className="mx-auto min-h-screen ">{children}</main>
      </body>
    </html>
  );
}
