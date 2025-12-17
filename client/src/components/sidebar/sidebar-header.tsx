'use client';

import Hamburger from 'hamburger-react';

import NeonText from '@/components/neon/neon-text';
import { styled } from '@/root/stitches.config';

const HeaderContainer = styled('div', {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '1.25rem',
});

const MenuTitle = styled('div', {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s ease, width 0.2s ease',
    variants: {
        collapsed: {
            true: { opacity: 0, width: 0 },
            false: { opacity: 1, width: 'auto' },
        },
    },
});

const HamburgerWrapper = styled('div', {
    transition: 'margin 0.2s ease',
    variants: {
        expanded: {
            true: { marginLeft: 'auto', marginRight: '-0.75rem' },
            false: { margin: '0 auto' },
        },
    },
});

type SidebarHeaderProps = {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
};

export function SidebarHeader({
    sidebarOpen,
    toggleSidebar,
}: SidebarHeaderProps) {
    return (
        <HeaderContainer>
            <MenuTitle collapsed={!sidebarOpen}>
                <NeonText
                    glowColor='--color-yellow-500'
                    className='text-2xl font-bold uppercase'
                    glowSpread={0.4}
                >
                    Menu
                </NeonText>
            </MenuTitle>
            <HamburgerWrapper expanded={sidebarOpen}>
                <Hamburger
                    toggled={sidebarOpen}
                    toggle={toggleSidebar}
                    size={30}
                />
            </HamburgerWrapper>
        </HeaderContainer>
    );
}
