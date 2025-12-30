import { useEffect, useState } from 'react';
import type {
    GameAccountFormData,
    StoreAccountStepProps,
} from '../../types/game-account.types';
import NeonBox from '../neon/neon-box';
import NeonIcon from '../neon/neon-icon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GameModalTitle from './game-modal-title';

interface StoreAccountStepPropsExtended extends StoreAccountStepProps {
    initialData?: Partial<GameAccountFormData>;
}

export default function StoreAccountStep({
    game,
    onBack,
    onSuccess,
    onSubmit,
    isLoading = false,
    error = null,
    initialData,
}: StoreAccountStepPropsExtended) {
    const [formData, setFormData] = useState<GameAccountFormData>({
        username: initialData?.username || '',
        password: initialData?.password || '',
        storeCredentials: initialData?.storeCredentials ?? true,
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                username: initialData.username || prev.username,
                password: initialData.password || prev.password,
                storeCredentials:
                    initialData.storeCredentials ?? prev.storeCredentials,
            }));
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) return;

        await onSubmit(formData);
    };

    const handleInputChange = (
        field: keyof GameAccountFormData,
        value: string | boolean
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className='max-w-[500px] px-2 pb-2 mx-auto'>
            <GameModalTitle
                title={game.name}
                description='Confirm your game account credentials to save them securely.'
            />

            <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Username
                        </label>
                        <Input
                            type='text'
                            value={formData.username}
                            onChange={e =>
                                handleInputChange('username', e.target.value)
                            }
                            placeholder='Enter your username'
                            required
                            className='w-full'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Password
                        </label>
                        <Input
                            type='password'
                            value={formData.password}
                            onChange={e =>
                                handleInputChange('password', e.target.value)
                            }
                            placeholder='Enter your password'
                            required
                            className='w-full'
                        />
                    </div>

                    <div className='flex items-center space-x-2'>
                        <input
                            type='checkbox'
                            id='storeCredentials'
                            checked={formData.storeCredentials}
                            onChange={e =>
                                handleInputChange(
                                    'storeCredentials',
                                    e.target.checked
                                )
                            }
                            className='rounded'
                        />
                        <label htmlFor='storeCredentials' className='text-sm'>
                            Store credentials for future use
                        </label>
                    </div>
                </div>

                {error && (
                    <NeonBox
                        glowColor='--color-red-500'
                        backgroundColor='--color-red-500'
                        backgroundOpacity={0.1}
                        className='p-3 rounded-lg'
                    >
                        <div className='flex items-center gap-2 text-red-400'>
                            <NeonIcon
                                icon='lucide:alert-circle'
                                size={16}
                                glowColor='--color-red-500'
                            />
                            <span className='text-sm'>{error}</span>
                        </div>
                    </NeonBox>
                )}

                <div className='flex gap-3'>
                    <Button
                        type='button'
                        variant='secondary'
                        onClick={onBack}
                        className='flex-1'
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                    <Button
                        type='submit'
                        className='flex-1'
                        disabled={
                            isLoading ||
                            !formData.username ||
                            !formData.password
                        }
                    >
                        {isLoading ? (
                            <div className='flex items-center gap-2'>
                                <NeonIcon
                                    icon='svg-spinners:bars-rotate-fade'
                                    size={16}
                                    glowColor='--color-blue-500'
                                />
                                Storing...
                            </div>
                        ) : (
                            'Store Account'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
