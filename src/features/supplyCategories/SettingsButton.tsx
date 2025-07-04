'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import SupplyCategoryPanel from './SupplyCategoryPanel';

export function SettingsButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-list"></i>} title="Supply categories" onClick={() => setOpen(true)} />
            {open && <SupplyCategoryPanel open={open} onClose={() => setOpen(false)} />}
        </>
    );
}
