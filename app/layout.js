export const metadata = {
  title: "CRM Media",
  description: "Chapel of Rest Ministry Media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
