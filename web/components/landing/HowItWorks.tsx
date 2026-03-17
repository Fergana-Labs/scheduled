'use client';

import {
  Mail,
  Brain,
  Calendar,
  FileText,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    title: 'Email Arrives',
    description:
      'Someone emails you asking to meet. Scheduler detects the new message via Gmail push notifications in real-time.',
    icon: Mail,
    color: 'blue',
  },
  {
    title: 'Intent Classified',
    description:
      'AI classifies the email: is it requesting a meeting, proposing specific times, or confirming a slot? Only scheduling emails are processed.',
    icon: Brain,
    color: 'purple',
  },
  {
    title: 'Calendar Checked',
    description:
      'Scheduler checks your availability across all your calendars — primary, shared, and synced — to find open slots.',
    icon: Calendar,
    color: 'green',
  },
  {
    title: 'Draft Composed',
    description:
      'A personalized reply is drafted in your email style, suggesting available times that match your scheduling preferences.',
    icon: FileText,
    color: 'orange',
  },
];

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
};

export default function HowItWorks() {
  return (
    <section className="bg-[#FAFAFA] py-28 sm:py-32" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600">
            How It Works
          </span>
        </div>
        <div className="mb-16 text-center sm:mb-20">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            From inbox to draft in seconds
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
            Scheduler works autonomously in the background — no manual intervention required
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClass =
              colorClasses[step.color as keyof typeof colorClasses];

            return (
              <div
                key={step.title}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
              >
                {/* Step Number */}
                <div className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Step {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClass} mb-4 transition-all duration-200 group-hover:scale-105`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="flex-1 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>

                {/* Arrow connector (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
