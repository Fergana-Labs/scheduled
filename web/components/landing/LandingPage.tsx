'use client';

import Header from './Header';
import Footer from './Footer';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Features from './Features';
import Statistics from './Statistics';
import Testimonials from './Testimonials';
import FAQ from './FAQ';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Statistics />
      <FAQ />

      {/* Final CTA Section */}
      <section className="bg-[#FAFAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Ready to stop scheduling manually?
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              Let AI handle the back-and-forth so you can focus on what matters
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_CONTROL_PLANE_URL}/auth/google`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800"
                >
                  Sign Up
                </a>
                <a
                  href="#faq"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Learn More
                </a>
              </div>
              <span className="text-sm text-gray-400">
                Works with Gmail and Google Calendar
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
