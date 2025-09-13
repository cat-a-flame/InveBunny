"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/Button/button";
import { Search } from "@/src/components/SearchBar/searchBar";

type FilterBarProps = {
    statusFilter: "active" | "inactive" | "all";
    categoryFilter: string[];
    variantFilter: string[];
    categories: { id: number; category_name: string }[];
    variants: { id: number; variant_name: string }[];
    categoryCounts: Record<string, number>;
    variantCounts: Record<string, number>;
    totalCount: number;
    statusCounts: Record<string, number>;
};

export function FilterBar({
    statusFilter: initialStatusFilter,
    categoryFilter: initialCategoryFilter,
    variantFilter: initialVariantFilter,
    categories,
    variants,
    categoryCounts,
    variantCounts,
    statusCounts,
}: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [categoryFilter, setCategoryFilter] = useState<string[]>(initialCategoryFilter);
    const [variantFilter, setVariantFilter] = useState<string[]>(initialVariantFilter);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

    useEffect(() => {
        setStatusFilter(initialStatusFilter);
        setCategoryFilter(initialCategoryFilter);
        setVariantFilter(initialVariantFilter);
        setSearchQuery(searchParams.get("query") || "");
    }, [initialStatusFilter, initialCategoryFilter, initialVariantFilter, searchParams]);

    const updateQueryParam = async (key: string, value: string | string[]) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        const stringValue = Array.isArray(value) ? value.join(',') : value;
        if (key === "statusFilter") {
            // keep status filter explicit so clearing it doesn't default to "active"
            params.set(key, stringValue);
        } else if (stringValue === "" || stringValue === "all") {
            params.delete(key);
        } else {
            params.set(key, stringValue);
        }

        params.delete("page");

        try {
            await router.push(`/products?${params.toString()}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        updateQueryParam("query", query);
    };

    const clearAllFilters = () => {
        const params = new URLSearchParams();
        if (searchParams.get("products")) {
            params.set("products", searchParams.get("products")!);
        }
        if (searchParams.get("tab")) {
            params.set("tab", searchParams.get("tab")!);
        }
        params.set("statusFilter", "all");
        router.push(`/products?${params.toString()}`);
    };

    const statusOptions = [
        { value: "active", label: `Active (${statusCounts['active'] ?? 0})` },
        { value: "inactive", label: `Inactive (${statusCounts['inactive'] ?? 0})` },
    ];

    const categoryOptions = categories.map(c => ({
        value: c.id.toString(),
        label: `${c.category_name} (${categoryCounts[c.id] ?? 0})`
    }));

    const variantOptions = variants.map(v => ({
        value: v.id.toString(),
        label: `${v.variant_name} (${variantCounts[v.id] ?? 0})`
    }));

    const selectedCategoryOptions = categoryOptions.filter(o => categoryFilter.includes(o.value));
    const selectedVariantOptions = variantOptions.filter(o => variantFilter.includes(o.value));

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const selectStatus = (value: string) => {
        setStatusFilter(value as any);
        updateQueryParam('statusFilter', value);
    };

    const toggleCategory = (value: string) => {
        const updated = categoryFilter.includes(value)
            ? categoryFilter.filter(v => v !== value)
            : [...categoryFilter, value];
        setCategoryFilter(updated);
        updateQueryParam('categoryFilter', updated);
    };

    const toggleVariant = (value: string) => {
        const updated = variantFilter.includes(value)
            ? variantFilter.filter(v => v !== value)
            : [...variantFilter, value];
        setVariantFilter(updated);
        updateQueryParam('variantFilter', updated);
    };

    const removeChip = (type: string, value: string) => {
        if (type === 'status') {
            setStatusFilter('all');
            updateQueryParam('statusFilter', 'all');
        } else if (type === 'category') {
            const updated = categoryFilter.filter(v => v !== value);
            setCategoryFilter(updated);
            updateQueryParam('categoryFilter', updated);
        } else if (type === 'variant') {
            const updated = variantFilter.filter(v => v !== value);
            setVariantFilter(updated);
            updateQueryParam('variantFilter', updated);
        }
    };

    const chips = [
        ...(statusFilter !== 'all'
            ? [{
                type: 'status',
                value: statusFilter,
                label: (<><span className="filter-chip-label">Status:&nbsp;</span> {statusOptions.find(o => o.value === statusFilter)?.label.split(' (')[0]}</>),
            }]
            : []),
        ...selectedCategoryOptions.map(o => ({
            type: 'category',
            value: o.value,
            label: (<><span className="filter-chip-label">Category:&nbsp;</span> {o.label.split(' (')[0]}</>),
        })),
        ...selectedVariantOptions.map(o => ({
            type: 'variant',
            value: o.value,
            label: (<><span className="filter-chip-label">Variant:&nbsp;</span> {o.label.split(' (')[0]}</>),
        })),
    ];

    const hasActiveFilters = () => {
        return (
            statusFilter !== 'all' ||
            categoryFilter.length > 0 ||
            variantFilter.length > 0 ||
            searchQuery.trim().length > 0
        );
    };

    return (
        <div className="filter-bar">
            <div className={`filter-bar-options ${isLoading ? 'filter-bar-loading' : ''}`}>
                <Search placeholder="Search for product name" query={searchQuery} onChange={handleSearch} size="md" />

                <div className="filter-dropdown">
                    <Button
                        onClick={() => {
                            setIsFiltersOpen(!isFiltersOpen);
                            setActiveMenu(null);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                    >
                        Filters
                    </Button>
                    {isFiltersOpen && (
                        <div className="drilldown-menu">
                            <div className={`drilldown-inner ${activeMenu ? 'show-sub' : ''}`}>
                                <div className="drilldown-main">
                                    <div className="drilldown-item" onClick={() => setActiveMenu('status')}>Status</div>
                                    <div className="drilldown-item" onClick={() => setActiveMenu('category')}>Category</div>
                                    <div className="drilldown-item" onClick={() => setActiveMenu('variant')}>Variant</div>
                                </div>
                                <div className="drilldown-sub">
                                    <div className="drilldown-item back" onClick={() => setActiveMenu(null)}>Back</div>
                                    {activeMenu === 'status' && statusOptions.map(o => (
                                        <div key={o.value} className="drilldown-item" onClick={() => selectStatus(o.value)}>
                                            <input type="radio" checked={statusFilter === o.value} readOnly /> {o.label}
                                        </div>
                                    ))}
                                    {activeMenu === 'category' && categoryOptions.map(o => (
                                        <div key={o.value} className="drilldown-item" onClick={() => toggleCategory(o.value)}>
                                            <input type="checkbox" checked={categoryFilter.includes(o.value)} readOnly /> {o.label}
                                        </div>
                                    ))}
                                    {activeMenu === 'variant' && variantOptions.map(o => (
                                        <div key={o.value} className="drilldown-item" onClick={() => toggleVariant(o.value)}>
                                            <input type="checkbox" checked={variantFilter.includes(o.value)} readOnly /> {o.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="filter-chips">
                {chips.length > 0 && (
                    <>
                        {chips.map(chip => (
                            <span key={chip.type + chip.value} className="filter-chip">
                                {chip.label}
                                <button type="button" onClick={() => removeChip(chip.type, chip.value)}>&times;</button>
                            </span>
                        ))}

                        <Button onClick={clearAllFilters} variant="ghost" size="sm" disabled={!hasActiveFilters()}>Clear filters</Button>
                    </>
                )}
            </div>
            <style jsx>{`
                .filter-dropdown { position: relative; display: inline-block; }
                .drilldown-menu { position: absolute; z-index: 10; background: #fff; border: 1px solid #ccc; margin-top: 4px; }
                .drilldown-inner { display: flex; width: 200%; transition: transform 0.3s ease; }
                .drilldown-inner.show-sub { transform: translateX(-50%); }
                .drilldown-main, .drilldown-sub { width: 50%; padding: 8px; }
                .drilldown-item { padding: 4px 8px; cursor: pointer; }
                .drilldown-item.back { font-weight: bold; }
            `}</style>
        </div>
    );
}