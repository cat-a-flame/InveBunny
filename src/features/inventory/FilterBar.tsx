"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IconButton } from "@/src/components/IconButton/iconButton";
import { Search } from "@/src/components/SearchBar/searchBar";

type FilterBarProps = {
    statusFilter: "active" | "inactive" | "all";
    categoryFilter: string[];
    variantFilter: string[];
    stockFilter: "all" | "low" | "out" | "in";
    categories: { id: number; category_name: string }[];
    variants: { id: number; variant_name: string }[];
    categoryCounts: Record<string, number>;
    variantCounts: Record<string, number>;
    totalCount: number;
    statusCounts: Record<string, number>;
    stockCounts: Record<string, number>;
};

export function FilterBar({
    statusFilter: initialStatusFilter,
    categoryFilter: initialCategoryFilter,
    variantFilter: initialVariantFilter,
    stockFilter: initialStockFilter,
    categories,
    variants,
    categoryCounts,
    variantCounts,
    totalCount,
    statusCounts,
    stockCounts,
}: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const slugFromPath = pathname.startsWith('/inventory/') ? pathname.split('/')[2] : null;
    const [isLoading, setIsLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [categoryFilter, setCategoryFilter] = useState<string[]>(initialCategoryFilter);
    const [variantFilter, setVariantFilter] = useState<string[]>(initialVariantFilter);
    const [stockFilter, setStockFilter] = useState(initialStockFilter);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

    useEffect(() => {
        setStatusFilter(initialStatusFilter);
        setCategoryFilter(initialCategoryFilter);
        setVariantFilter(initialVariantFilter);
        setStockFilter(initialStockFilter);
        setSearchQuery(searchParams.get("query") || "");
    }, [initialStatusFilter, initialCategoryFilter, initialVariantFilter, initialStockFilter, searchParams]);

    const updateQueryParam = async (key: string, value: string | string[]) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has("inventory") && slugFromPath) {
            params.set("inventory", slugFromPath);
        }

        const stringValue = Array.isArray(value) ? value.join(',') : value;
        if (stringValue === "" || stringValue === "all") {
            params.delete(key);
        } else {
            params.set(key, stringValue);
        }

        params.delete("page");

        try {
            await router.push(`/inventory?${params.toString()}`);
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
        if (searchParams.get("inventory")) {
            params.set("inventory", searchParams.get("inventory")!);
        } else if (slugFromPath) {
            params.set("inventory", slugFromPath);
        }
        if (searchParams.get("tab")) {
            params.set("tab", searchParams.get("tab")!);
        }
        params.set("statusFilter", "all");
        router.push(`/inventory?${params.toString()}`);
    };

    const statusOptions = [
        { value: "active", label: `Active (${statusCounts['active'] ?? 0})` },
        { value: "inactive", label: `Inactive (${statusCounts['inactive'] ?? 0})` },
    ];

    const stockOptions = [
        { value: "low", label: `Low stock (${stockCounts['low'] ?? 0})` },
        { value: "out", label: `Out of stock (${stockCounts['out'] ?? 0})` },
        { value: "in", label: `In stock (${stockCounts['in'] ?? 0})` },
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

    const hasActiveFilters = () => {
        return (
            statusFilter !== 'all' ||
            stockFilter !== 'all' ||
            categoryFilter.length > 0 ||
            variantFilter.length > 0 ||
            searchQuery.trim().length > 0
        );
    };

    const removeChip = (type: string, value: string) => {
        if (type === 'status') {
            setStatusFilter('all');
            updateQueryParam('statusFilter', 'all');
        } else if (type === 'stock') {
            setStockFilter('all');
            updateQueryParam('stockFilter', 'all');
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
                label: `Status: ${statusOptions.find(o => o.value === statusFilter)?.label.split(' (')[0]}`,
            }]
            : []),
        ...(stockFilter !== 'all'
            ? [{
                type: 'stock',
                value: stockFilter,
                label: `Stock: ${stockOptions.find(o => o.value === stockFilter)?.label.split(' (')[0]}`,
            }]
            : []),
        ...selectedCategoryOptions.map(o => ({
            type: 'category',
            value: o.value,
            label: `Category: ${o.label.split(' (')[0]}`,
        })),
        ...selectedVariantOptions.map(o => ({
            type: 'variant',
            value: o.value,
            label: `Variant: ${o.label.split(' (')[0]}`,
        })),
    ];

    return (
        <div className={`filter-bar ${isLoading ? 'filter-bar-loading' : ''}`}>
            <Search placeholder="Search for product name or SKU" query={searchQuery} onChange={handleSearch} size="md" />

            {chips.length > 0 && (
                <div className="filter-chips">
                    {chips.map(chip => (
                        <span key={chip.type + chip.value} className="filter-chip">
                            {chip.label}
                            <button type="button" onClick={() => removeChip(chip.type, chip.value)}>&times;</button>
                        </span>
                    ))}
                </div>
            )}

            <div>
                <label className="input-label">Status</label>
                <Select
                    classNamePrefix="react-select"
                    options={statusOptions}
                    value={statusOptions.find(o => o.value === statusFilter) || null}
                    onChange={(opt) => {
                        const value = (opt ? (opt as any).value : 'all') as "active" | "inactive" | "all";
                        setStatusFilter(value);
                        updateQueryParam('statusFilter', value);
                    }}
                    placeholder={`All (${totalCount})`}
                    isClearable
                    controlShouldRenderValue={false}
                    isDisabled={isLoading}
                />
            </div>

            <div>
                <label className="input-label">Category</label>
                <Select
                    classNamePrefix="react-select"
                    options={categoryOptions}
                    value={selectedCategoryOptions}
                    onChange={(opts) => {
                        const values = (opts || []).map((o: any) => o.value);
                        setCategoryFilter(values);
                        updateQueryParam('categoryFilter', values);
                    }}
                    placeholder="All"
                    isMulti
                    isClearable
                    controlShouldRenderValue={false}
                    isDisabled={isLoading}
                />
            </div>

            <div>
                <label className="input-label">Variant</label>
                <Select
                    classNamePrefix="react-select"
                    options={variantOptions}
                    value={selectedVariantOptions}
                    onChange={(opts) => {
                        const values = (opts || []).map((o: any) => o.value);
                        setVariantFilter(values);
                        updateQueryParam('variantFilter', values);
                    }}
                    placeholder="All"
                    isMulti
                    isClearable
                    controlShouldRenderValue={false}
                    isDisabled={isLoading}
                />
            </div>

            <div>
                <label className="input-label">Stock</label>
                <Select
                    classNamePrefix="react-select"
                    options={stockOptions}
                    value={stockOptions.find(o => o.value === stockFilter) || null}
                    onChange={(opt) => {
                        const value = (opt ? (opt as any).value : 'all') as "all" | "low" | "out" | "in";
                        setStockFilter(value);
                        updateQueryParam('stockFilter', value);
                    }}
                    placeholder={`All (${stockCounts['all'] ?? totalCount})`}
                    isClearable
                    controlShouldRenderValue={false}
                    isDisabled={isLoading}
                />
            </div>

            <IconButton onClick={clearAllFilters} icon={<i className="fa-solid fa-filter-circle-xmark"></i>} title="Clear filters" disabled={!hasActiveFilters()} />
        </div>
    );
}