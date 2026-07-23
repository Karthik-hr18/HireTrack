import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I apply for open positions at HireTrack?',
    answer: 'Select any open job listing from our Careers Portal, review the position requirements, and click "Apply Now". You can submit your resume PDF, LinkedIn profile, and contact details in under 60 seconds.'
  },
  {
    question: 'What file formats and sizes are supported for resume uploads?',
    answer: 'We accept PDF document attachments up to 5MB in size. Resumes are uploaded directly to our cloud attachment service for instant recruiter preview.'
  },
  {
    question: 'How does the technical interview scheduling process work?',
    answer: 'Once your application passes initial resume screening, our recruitment team schedules a technical panel interview and dispatches automated calendar notifications to your candidate portal.'
  },
  {
    question: 'Can I track the real-time status of my job application?',
    answer: 'Yes! Log into the Candidate Portal with your registered candidate email address to view real-time stage updates, interview details, and offer status.'
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Structured JSON-LD Schema
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_DATA.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <section style={{ margin: '48px 0', padding: '32px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '16px' }}>
      {/* Inject FAQPage JSON-LD script */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <HelpCircle size={24} style={{ color: '#6366f1' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f9fafb', margin: 0 }}>Frequently Asked Questions</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              style={{
                border: '1px solid #1f2937',
                borderRadius: '10px',
                backgroundColor: isOpen ? 'rgba(99, 102, 241, 0.05)' : '#0b0f19',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f9fafb',
                  fontSize: '15px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span>{item.question}</span>
                <ChevronDown size={18} style={{ color: '#6366f1', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>

              {isOpen && (
                <div style={{ padding: '0 20px 16px 20px', color: '#9ca3af', fontSize: '14px', lineHeight: '1.6' }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
