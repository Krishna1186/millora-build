
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does Millora ensure manufacturer quality?",
      answer: "We have a comprehensive vetting process that includes verification of business licenses, facility inspections, quality certifications, and review of past work samples. All manufacturers must maintain a minimum rating to stay active on our platform."
    },
    {
      question: "What types of manufacturing services are available?",
      answer: "Our platform covers the full spectrum of hardware manufacturing including PCB assembly, 3D printing, CNC machining, injection molding, electronic component sourcing, enclosure manufacturing, and complete product assembly."
    },
    {
      question: "How are payments handled?",
      answer: "We use a secure escrow system where payments are held until project milestones are completed to your satisfaction. This protects both customers and manufacturers while ensuring fair compensation for completed work."
    },
    {
      question: "Can I get quotes from multiple manufacturers?",
      answer: "Absolutely! You can submit your project requirements to multiple manufacturers and compare quotes, timelines, and capabilities before making your decision. This ensures you get the best value for your project."
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer: "We have a comprehensive dispute resolution process and quality guarantee. If work doesn't meet agreed specifications, we'll work with both parties to resolve the issue, which may include revisions, partial refunds, or finding alternative solutions."
    },
    {
      question: "How long does it take to find a manufacturer?",
      answer: "Most customers receive their first manufacturer responses within 24-48 hours of posting a project. The timeline for final selection depends on your project complexity and requirements review process."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white section-divider">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-light">
            Get answers to common questions about using Millora
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="luxury-card border-0">
              <AccordionTrigger className="text-left px-6 py-4 hover:no-underline hover:bg-gray-50 font-light text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 px-6 pb-6 font-light leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
