"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SupplyCategory = {
    id: string | number;
    category_name: string;
};

type Props = {
    categories: SupplyCategory[];
    selectedCategoryId?: string;
};

export function CategoryFilter({ categories, selectedCategoryId = "" }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [value, setValue] = useState<string>(selectedCategoryId);

    useEffect(() => {
        setValue(selectedCategoryId);
    }, [selectedCategoryId]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextValue = event.target.value;
        setValue(nextValue);

        const params = new URLSearchParams(searchParams.toString());

        if (nextValue) {
            params.set("category", nextValue);
        } else {
            params.delete("category");
        }

        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="filter-option">
            <select
                id="supplies-category-filter"
                value={value}
                onChange={handleChange}
                aria-label="Filter by category"
                disabled={categories.length === 0}
            >
                <option value="">All categories</option>
                {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                        {category.category_name}
                    </option>
                ))}
            </select>
        </div>
    );
}
