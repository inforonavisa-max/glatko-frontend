import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-teal-500/[0.06] blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-gray-200/60 bg-white/70 p-10 text-center shadow-xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03]">
          <span className="font-serif text-7xl font-bold bg-gradient-to-b from-teal-400 to-teal-600 bg-clip-text text-transparent">
            404
          </span>
          <h1 className="mt-4 font-serif text-2xl text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/en"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
