import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'McDonuts Updates - 5/19',
  description: 'Latest wedding updates from Lauren & David - May 19',
  openGraph: {
    title: 'McDonuts Updates - 5/19',
    description: 'Latest wedding updates from Lauren & David - May 19',
    images: [
      {
        url: '/optimized/formbggrad.webp',
        width: 1200,
        height: 630,
        alt: 'McDonuts Wedding Updates'
      }
    ]
  }
};

export default function UpdateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 