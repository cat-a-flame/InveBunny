import InventoryPage from '../page';

export default function InventorySlugPage({ params, searchParams }: { params: { inventory: string }; searchParams: any }) {
    const merged = { ...searchParams, inventory: params.inventory };
    return <InventoryPage searchParams={Promise.resolve(merged)} />;
}
