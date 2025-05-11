import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'L+D RSVP',
};

export default function RSVPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 