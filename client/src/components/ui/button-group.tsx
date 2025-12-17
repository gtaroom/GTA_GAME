import * as React from 'react';

import { cn } from '@/lib/utils';

interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'inline-flex items-center justify-center flex-wrap',
                className
            )}
        >
            {children}
        </div>
    );
};

export default ButtonGroup;
