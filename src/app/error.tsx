'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-light text-[#4B6CFF] mb-4">Oops!</h1>
        <h2 className="text-2xl font-light text-[#4B6CFF] mb-8">Something went wrong</h2>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="text-[#00B4AC] hover:text-[#FF7DC5] transition-colors duration-150"
          >
            Try again
          </button>
          <span className="text-[#4B6CFF]">|</span>
          <Link 
            href="/" 
            className="text-[#00B4AC] hover:text-[#FF7DC5] transition-colors duration-150"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 