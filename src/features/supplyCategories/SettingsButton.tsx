'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { SupplyCategorySettingsDialog } from './SupplyCategorySettingsDialog';

export function SettingsButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-cog"></i>} title="Settings" onClick={() => setOpen(true)} />
            {open && <SupplyCategorySettingsDialog open={open} onClose={() => setOpen(false)} />}
        </>
    );
}
