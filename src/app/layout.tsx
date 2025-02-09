import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'L + D',
  description: 'A beautiful wedding celebration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 