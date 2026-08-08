'use client';

import { useState } from 'react';
import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "What is the minimum deposit amount?",
    answer: "The minimum investment amount is $5.00, and the maximum is $1,000.00 per account."
  },
  {
    question: "How much is the Daily ROI?",
    answer: "You earn a fixed 1.0% Daily ROI on your active investment for 200 days, totaling 200% return."
  },
  {
    question: "When are daily returns credited?",
    answer: "Daily returns are automatically calculated and credited to your ROI wallet every 24 hours based on the time of your investment activation."
  },
  {
    question: "Do I need a referral code to join?",
    answer: "Yes, NexaRise is an invite-only network marketing platform. You must have a sponsor's referral code to register."
  },
  {
    question: "How does the Level Income work?",
    answer: "You earn percentage commissions based on investments made by your team up to 10 levels deep. Level 1 is 10%, Level 2 is 3%, Level 3 is 2%, Levels 4-6 are 1%, and Levels 7-10 are 0.5%. Note: You need 1 direct referral for Level 1, 2 for Level 2, up to 10 directs to unlock all 10 levels."
  },
  {
    question: "Are there any fees for P2P transfers?",
    answer: "Yes, there is a flat 2% fee on all internal P2P (peer-to-peer) wallet transfers."
  },
  {
    question: "What are Achievement Rewards?",
    answer: "Achievement Rewards are one-time cash bonuses given when your total team business volume hits certain milestones, starting from $25 for $1,000 volume up to $100,000 for $5,000,000 volume."
  },
  {
    question: "How long does a withdrawal take?",
    answer: "Crypto withdrawals are processed via automated systems and usually take a few minutes to hours depending on blockchain network congestion."
  },
  {
    question: "Can I have multiple accounts?",
    answer: "No, multiple accounts are strictly prohibited to maintain fairness in the network. Any user found with multiple accounts may face suspension."
  },
  {
    question: "Is my investment secure?",
    answer: "We employ bank-grade encryption and secure ledger technologies to protect your funds and data. However, all investments carry inherent risks. Please refer to our Risk Disclosure for more details."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">Find answers to common questions about NexaRise.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border rounded-lg bg-card overflow-hidden transition-all duration-200">
                  <button
                    className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none focus-visible:ring-2 ring-primary"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                  <div 
                    className={cn(
                      "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-48 pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-muted-foreground mt-2">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
