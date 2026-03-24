import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl font-bold text-teal-500/20">404</span>
        <h1 className="mt-4 font-serif text-2xl text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">The page you are looking for does not exist.</p>
        <Link href="/en" className="mt-8 inline-block rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white">
          Go Home
        </Link>
      </div>
    </div>
  );
}
