import * as React from 'react';

import NeonText from '@/components/neon/neon-text';

interface AuthTitleProps {
    title: string | false;
    description?: string | false;
}

const AuthTitle: React.FC<AuthTitleProps> = ({ title, description }) => {
    return (
        title &&
        description && (
            <div className='mb-8 lg:mb-10 text-center'>
                {title && (
                    <NeonText as='h1' className='h1-title mb-3.5'>
                        {title}
                    </NeonText>
                )}
                {description && (
                    <p className='tracking-common text-sm md:text-base xl:text-lg font-extrabold capitalize'>
                        {description}
                    </p>
                )}
            </div>
        )
    );
};

export default AuthTitle;
