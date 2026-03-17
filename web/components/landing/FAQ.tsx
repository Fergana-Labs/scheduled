'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Scheduler?',
    answer:
      'Scheduler is an AI-powered scheduling agent that monitors your Gmail inbox for scheduling requests, checks your calendar availability, and automatically drafts personalized reply emails suggesting meeting times. It works in the background so you never have to manually handle scheduling back-and-forth again.',
  },
  {
    question: 'How is this different from Calendly or other scheduling tools?',
    answer:
      "Unlike Calendly which requires you to send a link and forces the other person to use a booking page, Scheduler works directly within your email. It reads the incoming message, understands the context, and drafts a natural reply in your voice. The other person never knows AI is involved — it feels like a normal email conversation.",
  },
  {
    question: 'How does Scheduler learn my email style?',
    answer:
      'During onboarding, Scheduler analyzes your past emails to understand your writing patterns — how you greet people, how you propose times, your sign-off style, and your overall tone. It generates a style guide that is injected into every draft, ensuring replies sound authentically like you.',
  },
  {
    question: 'What calendars does Scheduler check?',
    answer:
      'Scheduler checks all your Google Calendars including your primary calendar, shared team calendars, and a dedicated "Scheduler Calendar" that captures commitments from emails and texts that might not be on your main calendar.',
  },
  {
    question: 'Does Scheduler send emails automatically?',
    answer:
      'No. Scheduler creates draft replies in your Gmail drafts folder. You review each draft and send it yourself. This gives you full control over every response while eliminating the tedious work of checking calendars and composing replies.',
  },
  {
    question: 'What types of scheduling emails does it handle?',
    answer:
      'Scheduler classifies emails into four categories: requests to meet (someone asking to schedule), time proposals (someone suggesting specific times), time confirmations (someone confirming a slot), and non-scheduling emails (which are ignored). It handles the full scheduling conversation lifecycle.',
  },
  {
    question: 'Is my email data secure?',
    answer:
      'Yes. Scheduler uses Google OAuth for authentication and never stores your email content. Your Google credentials are held securely in an isolated control plane and are never sent to AI sandboxes. The AI only sees the specific email threads it needs to process.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="bg-white py-28 sm:py-32" id="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-1.5 text-sm font-medium text-gray-600">
              FAQ
            </span>
          </div>
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
              Everything you need to know about Scheduler
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <h3 className="pr-4 text-base font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-sm leading-relaxed text-gray-500">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Have more questions?{' '}
              <a
                href="mailto:hi@ferganalabs.com"
                className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
