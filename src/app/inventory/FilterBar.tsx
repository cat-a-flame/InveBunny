"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Option = { id: number; name: string };

export function InventoryFilterBar({
    categories,
    variants,
}: {
    categories: Option[];
    variants: Option[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [variant, setVariant] = useState("");

    // Wait until client-side searchParams is available
    useEffect(() => {
        if (!searchParams) return;

        setStock(searchParams.get("stock") || "");
        setCategory(searchParams.get("category") || "");
        setVariant(searchParams.get("variant") || "");
    }, [searchParams]);

    // Update URL when filters change
    useEffect(() => {
        if (!searchParams) return;

        const params = new URLSearchParams(searchParams.toString());

        stock ? params.set("stock", stock) : params.delete("stock");
        category ? params.set("category", category) : params.delete("category");
        variant ? params.set("variant", variant) : params.delete("variant");

        router.replace(`${pathname}?${params.toString()}`);
    }, [stock, category, variant]);

    return (
        <div className="filter-bar">
            <select name="stock-status" value={stock} onChange={(e) => setStock(e.target.value)}>
                <option value="">Stock status</option>
                <option value="in-stock">In stock</option>
                <option value="low-stock">Low stock</option>
                <option value="out-of-stock">Out of stock</option>
            </select>

            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Category</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <select name="variant" value={variant} onChange={(e) => setVariant(e.target.value)}>
                <option value="">Variant</option>
                {variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
        </div>
    );
}
