'use client';

import { useEffect, useState, forwardRef } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { trackPageEvent } from '@/lib/analytics';

const SIGNUP_URL = `${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/login?signup=1`;
const BOOKING_URL = process.env.NEXT_PUBLIC_DEMO_BOOKING_URL || 'mailto:henry@ferganalabs.com';

const BookingCTA = forwardRef<HTMLDivElement>(function BookingCTA(_, ref) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full py-12 text-center transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-normal italic tracking-tight text-gray-900 sm:text-4xl">
        That&apos;s Scheduled in action.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-500">
        Want to see it handle your inbox?
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <a
          href={SIGNUP_URL}
          onClick={() => trackPageEvent('demo_cta_signup_click')}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#43614a] px-7 py-3 text-sm font-medium text-white transition-all hover:bg-[#527559]"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href={BOOKING_URL}
          onClick={() => trackPageEvent('demo_cta_book_click')}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-gray-300 px-7 py-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-900 hover:text-gray-900"
        >
          <CalendarDays className="h-4 w-4" />
          Book a Demo Call
        </a>
      </div>
    </div>
  );
});

export default BookingCTA;
