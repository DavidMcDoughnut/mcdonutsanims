import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-light text-[#4B6CFF] mb-4">404</h1>
        <h2 className="text-2xl font-light text-[#4B6CFF] mb-8">Page Not Found</h2>
        <Link 
          href="/" 
          className="text-[#00B4AC] hover:text-[#FF7DC5] transition-colors duration-150"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 