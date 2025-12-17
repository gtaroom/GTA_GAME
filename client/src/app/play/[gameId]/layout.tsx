import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Play Game',
    description: 'Enjoy your game experience',
};

export default function GamePlayLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="game-page-active">
            {children}
        </div>
    );
}
