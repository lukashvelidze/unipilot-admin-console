import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is UniPilot?',
    answer:
      'UniPilot is a comprehensive platform designed to help international students navigate the student visa application process. We provide personalized document checklists, deadline tracking, and step-by-step guidance for visa applications to various countries.',
  },
  {
    question: 'Which countries does UniPilot support?',
    answer:
      'UniPilot currently supports student visa applications for major study destinations including the United States, United Kingdom, Canada, Australia, Germany, and more. We are continuously expanding our coverage to include additional countries.',
  },
  {
    question: 'How does the personalized checklist work?',
    answer:
      'When you create your profile, you provide information about your destination country, visa type, and personal situation. Based on this information, UniPilot generates a customized checklist of all the documents and requirements specific to your application.',
  },
  {
    question: 'Is UniPilot free to use?',
    answer:
      'UniPilot offers both free and premium tiers. The free tier provides access to basic checklists and guidance. Premium subscriptions unlock additional features such as priority support, advanced tracking, and exclusive resources.',
  },
  {
    question: 'Can UniPilot guarantee my visa approval?',
    answer:
      'While UniPilot provides comprehensive guidance and helps ensure your application is complete and well-organized, we cannot guarantee visa approval. Final decisions are made by the respective immigration authorities. However, our platform significantly improves your chances by helping you avoid common mistakes and meet all requirements.',
  },
  {
    question: 'How do I track my application progress?',
    answer:
      'UniPilot provides a dashboard where you can mark documents as completed, set reminders for deadlines, and track your overall application progress. You can also receive notifications for important dates and milestones.',
  },
  {
    question: 'What if my visa requirements change?',
    answer:
      'We regularly update our database to reflect the latest visa requirements from each country. If there are changes that affect your application, you will be notified, and your checklist will be updated accordingly.',
  },
  {
    question: 'How can I contact support?',
    answer:
      'You can reach our support team through the contact form on our website or by emailing support@unipilot.com. Premium users have access to priority support with faster response times.',
  },
  {
    question: 'Is my personal information secure?',
    answer:
      'Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. Please review our Privacy Policy for more details.',
  },
  {
    question: 'Can I use UniPilot on mobile devices?',
    answer:
      'Yes, UniPilot is fully responsive and works on all devices including smartphones, tablets, and desktop computers. You can access your account and manage your application from anywhere.',
  },
];

export function FAQsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about UniPilot and how we can help
            you with your student visa application.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? We're here to help.
          </p>
          <a
            href="mailto:support@unipilot.com"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
