import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RSVP to L + D',
  description: 'RSVP to Lauren and David\'s Wedding in Saint-Jean-Cap-Ferrat',
  openGraph: {
    title: 'RSVP to L + D',
    description: 'RSVP to Lauren and David\'s Wedding in Saint-Jean-Cap-Ferrat',
    images: [
      {
        url: '/optimized/formbgarr2-og.webp', // We'll create this optimized version
        width: 1200,
        height: 630,
        alt: 'RSVP to Lauren and David\'s Wedding'
      }
    ]
  }
};

export default function RSVPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 