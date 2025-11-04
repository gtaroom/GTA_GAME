import NeonText from '@/components/neon/neon-text';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { FaqItem, vipProgramFaqData } from '@/data/faq';

export default function VIPProgramFAQ() {
    const accordion = (faq: FaqItem, index: number) => (
        <AccordionItem value={index.toString()} key={index}>
            <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline focus-visible:ring-0'>
                {faq.question}
            </AccordionTrigger>
            <AccordionContent>
                <div
                    className='faq-answer'
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
            </AccordionContent>
        </AccordionItem>
    );

    return (
        <section className='mb-20'>
            <div className='container-xxl'>
                <NeonText as='h2' className='h2-title mb-8 text-center'>
                    FAQS
                </NeonText>

                <Accordion
                    type='single'
                    collapsible
                    className='w-full space-y-2'
                    defaultValue='3'
                >
                    <div className='grid lg:grid-cols-2 gap-4 lg:gap-6'>
                        <div className='space-y-4 lg:space-y-6'>
                            {vipProgramFaqData.map(
                                (faq, index) =>
                                    index % 2 === 0 && accordion(faq, index)
                            )}
                        </div>
                        <div className='space-y-4 lg:space-y-6'>
                            {vipProgramFaqData.map(
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
