'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();

  return (
    <header
      className="relative border-b border-gray-100 bg-white"
      style={{ zIndex: 10 }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex">
          <button
            onClick={() => router.push('/')}
            className="-m-1.5 flex cursor-pointer items-center gap-2 p-1.5 transition-opacity hover:opacity-80"
          >
            <span className="sr-only">Go to Stash homepage</span>
            <Image
              src="/logo.png"
              alt="Stash Logo"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-gray-900 sm:text-2xl">
              Stash
            </span>
          </button>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google`}
            className="inline-flex items-center rounded-xl border border-transparent bg-[#43614a] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:cursor-pointer hover:bg-[#527559] focus:ring-2 focus:ring-[#43614a] focus:ring-offset-2 focus:outline-none sm:px-4 sm:py-2 sm:text-sm"
          >
            Sign Up
          </a>
        </div>
      </nav>
    </header>
  );
}
