"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <button onClick={reset} className="rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white">
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
