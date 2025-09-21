'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SupplyCategoryFilterProps = {
    categories: { id: string; category_name: string }[];
    selectedCategory: string;
};

export function SupplyCategoryFilter({ categories, selectedCategory }: SupplyCategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(selectedCategory);

    useEffect(() => {
        setValue(selectedCategory);
    }, [selectedCategory]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setValue(newValue);

        const params = new URLSearchParams(searchParams.toString());

        if (newValue) {
            params.set('category', newValue);
        } else {
            params.delete('category');
        }

        params.set('page', '1');

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    return (
        <select value={value} onChange={handleChange} aria-label="Filter supplies by category">
            <option value="">All categories</option>
            {categories.map(category => (
                <option key={category.id} value={category.id}>
                    {category.category_name}
                </option>
            ))}
        </select>
    );
}
