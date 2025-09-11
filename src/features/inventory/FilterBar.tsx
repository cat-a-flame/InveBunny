"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/src/components/Button/button";
import { Search } from "@/src/components/SearchBar/searchBar";

type FilterBarProps = {
    statusFilter: "active" | "inactive" | "all";
    categoryFilter: string[];
    variantFilter: string[];
    stockFilter: "all" | "low" | "out" | "in";
    sortField: 'name' | 'date';
    sortOrder: 'asc' | 'desc';
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
    sortField: initialSortField,
    sortOrder: initialSortOrder,
    categories,
    variants,
    categoryCounts,
    variantCounts,
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
    const [sortField, setSortField] = useState(initialSortField);
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

    useEffect(() => {
        setStatusFilter(initialStatusFilter);
        setCategoryFilter(initialCategoryFilter);
        setVariantFilter(initialVariantFilter);
        setStockFilter(initialStockFilter);
        setSortField(initialSortField);
        setSortOrder(initialSortOrder);
        setSearchQuery(searchParams.get("query") || "");
    }, [initialStatusFilter, initialCategoryFilter, initialVariantFilter, initialStockFilter, initialSortField, initialSortOrder, searchParams]);

    const updateQueryParam = async (key: string, value: string | string[]) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has("inventory") && slugFromPath) {
            params.set("inventory", slugFromPath);
        }

        const stringValue = Array.isArray(value) ? value.join(',') : value;
        if (key === "statusFilter") {
            // always keep explicit status filter so clearing it doesn't
            // revert to the default "active" filter
            params.set(key, stringValue);
        } else if (stringValue === "" || stringValue === "all") {
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

    const sortOptions = [
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'date-asc', label: 'Date added (Oldest first)' },
        { value: 'date-desc', label: 'Date added (Newest first)' },
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
                label: (<><span className="filter-chip-label">Status:&nbsp;</span> {statusOptions.find(o => o.value === statusFilter)?.label.split(' (')[0]}</>),
            }]
            : []),
        ...(stockFilter !== 'all'
            ? [{
                type: 'stock',
                value: stockFilter,
                label: (<><span className="filter-chip-label">Stock:&nbsp;</span> {stockOptions.find(o => o.value === stockFilter)?.label.split(' (')[0]}</>),
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

    return (
        <div className="filter-bar">
            <div className={`filter-bar-options ${isLoading ? 'filter-bar-loading' : ''}`}>
                <Search placeholder="Search for product name or SKU" query={searchQuery} onChange={handleSearch} size="md" />

                    <Select
                        classNamePrefix="react-select"
                        options={sortOptions}
                        value={sortOptions.find(o => o.value === `${sortField}-${sortOrder}`) || null}
                        onChange={(opt) => {
                            const value = (opt ? (opt as any).value : 'name-asc') as string;
                            const [field, order] = value.split('-') as ['name' | 'date', 'asc' | 'desc'];
                            setSortField(field);
                            setSortOrder(order);
                            updateQueryParam('sortField', field);
                            updateQueryParam('sortOrder', order);
                        }}
                        placeholder="Sort by"
                        isClearable={false}
                        controlShouldRenderValue={false}
                        isDisabled={isLoading}
                    />

                    <Select
                        classNamePrefix="react-select"
                        options={statusOptions}
                        value={statusOptions.find(o => o.value === statusFilter) || null}
                        onChange={(opt) => {
                            const value = (opt ? (opt as any).value : 'all') as "active" | "inactive" | "all";
                            setStatusFilter(value);
                            updateQueryParam('statusFilter', value);
                        }}
                        placeholder="Status"
                        isClearable={false}
                        controlShouldRenderValue={false}
                        isDisabled={isLoading}
                    />

                    <Select
                        classNamePrefix="react-select"
                        options={categoryOptions}
                        value={selectedCategoryOptions}
                        onChange={(opts) => {
                            const values = (opts || []).map((o: any) => o.value);
                            setCategoryFilter(values);
                            updateQueryParam('categoryFilter', values);
                        }}
                        placeholder="Category"
                        isMulti
                        isClearable={false}
                        controlShouldRenderValue={false}
                        isDisabled={isLoading}
                    />

                    <Select
                        classNamePrefix="react-select"
                        options={variantOptions}
                        value={selectedVariantOptions}
                        onChange={(opts) => {
                            const values = (opts || []).map((o: any) => o.value);
                            setVariantFilter(values);
                            updateQueryParam('variantFilter', values);
                        }}
                        placeholder="Variant"
                        isMulti
                        isClearable={false}
                        controlShouldRenderValue={false}
                        isDisabled={isLoading}
                    />

                    <Select
                        classNamePrefix="react-select"
                        options={stockOptions}
                        value={stockOptions.find(o => o.value === stockFilter) || null}
                        onChange={(opt) => {
                            const value = (opt ? (opt as any).value : 'all') as "all" | "low" | "out" | "in";
                            setStockFilter(value);
                            updateQueryParam('stockFilter', value);
                        }}
                        placeholder="Stock status"
                        isClearable={false}
                        controlShouldRenderValue={false}
                        isDisabled={isLoading}
                    />
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
                    
                        <Button onClick={clearAllFilters} variant="ghost" size="sm" disabled={!hasActiveFilters()}>Clear all</Button>
                    </>
                )}
            </div>
        </div>
    );
}