import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Atypica LLM
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
            Discover and understand unique personas through AI-powered analysis
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <Link
              href="/scout"
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-2">Scout</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find and analyze unique personalities from Xiaohongshu
              </p>
            </Link>

            <Link
              href="/interview"
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold mb-2">Interview</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Deep dive into constructed personas through AI interviews
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
