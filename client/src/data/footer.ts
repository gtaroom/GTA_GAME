import {
    footerAccountLinks,
    footerLegalLinks,
    footerQuickLinks,
    footerProgramsLinks,
} from './links';

export const footerLinks = [
    {
        id: 'quick-links',
        title: 'QUICK LINKS',
        links: footerQuickLinks,
    },
    {
        id: 'my-account',
        title: 'MY ACCOUNT',
        links: footerAccountLinks,
    },
    {
        id: 'legal-policies',
        title: 'LEGAL & POLICIES',
        links: footerLegalLinks,
    },
];

export const footerProgramsSection = {
    id: 'programs-rewards',
    title: 'PROGRAMS & REWARDS',
    links: footerProgramsLinks,
};
