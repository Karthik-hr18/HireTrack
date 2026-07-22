import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

const FAQS = [
  {
    question: 'Do you offer remote work opportunities?',
    answer: 'Yes! We are a remote-first organization. Our team members work asynchronously from over 40 countries across the globe. We provide generous home office stipends and co-working allowances.',
  },
  {
    question: 'What is the interview process like at HireTrack?',
    answer: 'Our interview process is streamlined, fast, and respectful of your time. Typically it consists of a 30-minute initial chat, a technical/craft practical assessment, a system architecture discussion, and a culture conversation with leadership.',
  },
  {
    question: 'How does equipment & home office setup work?',
    answer: 'Once hired, you get a choice of top-tier hardware (MacBook Pro or Linux workstation) plus a $1,500 budget for monitors, ergonomic seating, audio equipment, and peripherals.',
  },
  {
    question: 'Can I apply for multiple roles simultaneously?',
    answer: 'While you can submit applications for multiple roles, we recommend applying for the position that best aligns with your core skills and career trajectory for the fastest review.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" style={{ padding: '80px 0', backgroundColor: 'var(--gray-bg)', borderTop: '1px solid var(--gray-border)' }}>
      <div className="careers-container">
        <ScrollReveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 840, margin: '0 auto' }}>
            {/* Section Header at Top */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
                Questions & Answers
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 14 }}>
                We're glad you asked...
              </h2>
              <p style={{ fontSize: 15, color: 'var(--gray-text-muted)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
                Everything you need to know about joining our team, our hiring culture, and what to expect during evaluation.
              </p>
            </div>

            {/* Questions Below Header */}
            <div>
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="careers-faq-item">
                    <button
                      type="button"
                      className="careers-faq-trigger"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={20}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                          color: isOpen ? 'var(--accent)' : 'var(--gray-text-muted)',
                          flexShrink: 0,
                          marginLeft: 12,
                        }}
                      />
                    </button>

                    <div className={`careers-faq-content-wrapper ${isOpen ? 'is-open' : ''}`}>
                      <div className="careers-faq-content-inner">
                        <div className="careers-faq-content">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
