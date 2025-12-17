'use client';

import { useId, useState, useEffect } from 'react';

import { Switch } from '@/components/ui/switch';

interface StatusSwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
}

export default function StatusSwitch({ checked = false, onChange, disabled = false }: StatusSwitchProps) {
    const id = useId();
    const [isChecked, setIsChecked] = useState(checked);
    
    // Sync internal state with prop changes
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);
    
    const toggleSwitch = () => {
        if (disabled) return;
        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };

    const handleEnable = () => {
        if (disabled) return;
        setIsChecked(true);
        onChange?.(true);
    };

    const handleDisable = () => {
        if (disabled) return;
        setIsChecked(false);
        onChange?.(false);
    };

    return (
        <div
            className='group inline-flex items-center gap-2'
            data-state={isChecked ? 'checked' : 'unchecked'}
        >
            <span
                id={`${id}-off`}
                className={`group-data-[state=checked]:text-white/50! flex-1 text-right text-sm font-medium text-white! ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                aria-controls={id}
                onClick={handleDisable}
            >
                Disable
            </span>
            <Switch
                id={id}
                checked={isChecked}
                onCheckedChange={toggleSwitch}
                disabled={disabled}
                aria-labelledby={`${id}-off ${id}-on`}
            />
            <span
                id={`${id}-on`}
                className={`group-data-[state=unchecked]:text-white/50! flex-1 text-left text-sm font-medium text-white! ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                aria-controls={id}
                onClick={handleEnable}
            >
                Enable
            </span>
        </div>
    );
}
