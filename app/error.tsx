"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-2xl font-serif">!</span>
        </div>
        <h1 className="font-serif text-2xl text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">An unexpected error occurred.</p>
        <button onClick={reset} className="mt-8 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white">
          Try Again
        </button>
      </div>
    </div>
  );
}
