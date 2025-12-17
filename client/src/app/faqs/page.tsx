import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { faqData, FaqItem } from '@/data/faq';

import NeonText from '@/components/neon/neon-text';

export default function FAQ() {
    const accordion = (faq: FaqItem, index: number) => (
        <AccordionItem value={index.toString()} key={index}>
            <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline focus-visible:ring-0'>
                {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
    );

    return (
        <section className='pt-5 md:pt-8 mb-14'>
            <div className='container-xxl'>
                <div className='max-w-[800px] mx-auto text-center mb-10'>
                    <NeonText as='h1' className='h1-title mb-4'>
                        Frequently Asked Questions
                    </NeonText>
                    <p className='text-lg font-semibold'>
                        Find answers to common questions about Golden Ticket
                        Online Arcade and Casino
                    </p>
                </div>

                <Accordion
                    type='single'
                    collapsible
                    className='w-full space-y-2'
                    defaultValue='3'
                >
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-6'>
                            {faqData.map(
                                (faq, index) =>
                                    index % 2 === 0 && accordion(faq, index)
                            )}
                        </div>
                        <div className='space-y-6'>
                            {faqData.map(
                                (faq, index) =>
                                    index % 2 !== 0 && accordion(faq, index)
                            )}
                        </div>
                    </div>
                </Accordion>
            </div>
        </section>
    );
}
