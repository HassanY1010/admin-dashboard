import "./globals.css";
export const metadata: any = {
  title: "حسابك في جيبك - لوحة تحكم الإدارة",
  description: "منصة إدارة الأعمال التجارية بين الشركات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}