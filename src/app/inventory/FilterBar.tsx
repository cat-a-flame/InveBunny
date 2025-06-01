"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconButton } from "@/src/components/IconButton/iconButton";
import { Search } from "@/src/components/SearchBar/searchBar";

type FilterBarProps = {
    statusFilter: "active" | "inactive" | "all";
    categoryFilter: string;
    variantFilter: string;
    stockFilter: "all" | "low" | "out" | "in";
    categories: { id: number; category_name: string }[];
    variants: { id: number; variant_name: string }[];
};

export function FilterBar({
    statusFilter: initialStatusFilter,
    categoryFilter: initialCategoryFilter,
    variantFilter: initialVariantFilter,
    stockFilter: initialStockFilter,
    categories,
    variants,
}: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
    const [variantFilter, setVariantFilter] = useState(initialVariantFilter);
    const [stockFilter, setStockFilter] = useState(initialStockFilter);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

    useEffect(() => {
        setStatusFilter(initialStatusFilter);
        setCategoryFilter(initialCategoryFilter);
        setVariantFilter(initialVariantFilter);
        setStockFilter(initialStockFilter);
        setSearchQuery(searchParams.get("query") || "");
    }, [initialStatusFilter, initialCategoryFilter, initialVariantFilter, initialStockFilter, searchParams]);

    const updateQueryParam = async (key: string, value: string) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());

        if (key === "statusFilter") {
            if (value === "all") {
                params.set(key, "all");
            } else {
                params.set(key, value);
            }
        }
        else if (value === "" || value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
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
        }
        if (searchParams.get("tab")) {
            params.set("tab", searchParams.get("tab")!);
        }
        router.push(`/inventory?${params.toString()}`);
    };

    const hasActiveFilters = () => {
        const filterKeys = ["query", "statusFilter", "categoryFilter", "variantFilter", "stockFilter"];
        return filterKeys.some(key => searchParams.has(key));
    };

    return (
        <div className={`filter-bar ${isLoading ? 'filter-bar-loading' : ''}`}>
            <Search placeholder="Search for product name or SKU" query={searchQuery} onChange={handleSearch} size="md" />

            <div>
                <label htmlFor="status-filter" className="input-label">Status</label>
                <select id="status-filter" value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { const value = e.target.value as "active" | "inactive" | "all"; setStatusFilter(value); updateQueryParam("statusFilter", value);}} disabled={isLoading}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div>
                <label htmlFor="category-filter" className="input-label">Category</label>
                <select id="category-filter" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); updateQueryParam("categoryFilter", e.target.value); }} disabled={isLoading}>
                    <option value="all">All</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                            {c.category_name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="variant-filter" className="input-label">Variant</label>
                <select id="variant-filter" value={variantFilter} onChange={(e) => { setVariantFilter(e.target.value); updateQueryParam("variantFilter", e.target.value); }} disabled={isLoading}>
                    <option value="all">All</option>
                    {variants.map((v) => (
                        <option key={v.id} value={v.id.toString()}>
                            {v.variant_name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="stock-filter" className="input-label">Stock</label>
                <select id="stock-filter" value={stockFilter} onChange={(e) => { setStockFilter(e.target.value as "all" | "low" | "out" | "in"); updateQueryParam("stockFilter", e.target.value); }} disabled={isLoading}>
                    <option value="all">All</option>
                    <option value="low">Low stock</option>
                    <option value="out">Out of stock</option>
                    <option value="in">In stock</option>
                </select>
            </div>

            <IconButton onClick={clearAllFilters} icon={<i className="fa-solid fa-filter-circle-xmark"></i>} title="Clear filters" disabled={!hasActiveFilters(searchParams)} />
        </div>
    );
}