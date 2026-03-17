'use client';

import { Quote } from 'lucide-react';

const testimonials = [
  {
    content:
      "I get 30+ scheduling emails a week during hiring season. Scheduler drafts replies that sound exactly like me — I just hit send. It's saved me hours every week.",
  },
  {
    content:
      "The best part is it actually checks my calendar before suggesting times. No more double-booking or manually cross-referencing three different calendars.",
  },
  {
    content:
      "I was skeptical that AI could match my email style, but the drafts are spot-on. People don't even realize they're talking to an agent-assisted reply.",
  },
  {
    content:
      "As a founder, scheduling is one of those tasks that's too small to delegate to a human but too tedious to do yourself. Scheduler is the perfect middle ground.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-28 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-1.5 text-sm font-medium text-gray-600">
            Testimonials
          </span>
        </div>
        <div className="mb-16 text-center">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Trusted by busy professionals
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl border border-gray-200 bg-[#FAFAFA] p-8"
            >
              <Quote className="mb-4 h-6 w-6 text-gray-300" />
              <p className="text-lg leading-relaxed text-gray-600">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
