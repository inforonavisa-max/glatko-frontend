"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white min-h-screen flex items-center justify-center">
        <div className="relative w-full max-w-md mx-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-teal-500/10 blur-[100px]" />
          </div>
          <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <span className="font-bold text-3xl text-red-400">!</span>
            </div>
            <h1 className="mt-6 text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm text-white/50">
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="mt-8 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
