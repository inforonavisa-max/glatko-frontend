"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F6F0] text-gray-900 dark:bg-[#0b1f23] dark:text-white flex items-center justify-center">
        <div className="relative w-full max-w-md mx-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-teal-500/[0.06] blur-[100px] dark:bg-teal-500/10" />
          </div>
          <div className="relative rounded-3xl border border-gray-200/60 bg-white/70 p-10 text-center shadow-xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="mb-6 flex items-center justify-center gap-1">
              <span className="text-lg font-bold tracking-tight">Glatko</span>
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
            </div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
              <span className="font-bold text-3xl text-red-500 dark:text-red-400">!</span>
            </div>
            <h1 className="mt-6 font-serif text-2xl">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="mt-8 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
