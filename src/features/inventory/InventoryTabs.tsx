import { slugify } from '@/src/utils/slugify';

type Inventory = {
    id: number;
    inventory_name: string;
    is_default: boolean;
};

type TabsProps = {
    inventories: Inventory[];
    selectedInventory: Inventory;
    tab: string;
};

export function InventoryTabs({ inventories, selectedInventory, tab }: TabsProps) {
    const selectedSlug = slugify(selectedInventory.inventory_name);

    return (
        <ul className="tabs">
            {inventories.map(inv => {
                const invSlug = slugify(inv.inventory_name);
                return (
                    <li key={inv.id} className={invSlug === selectedSlug && tab === 'active' ? 'active' : ''}>
                        <a href={`/inventory?inventory=${invSlug}`} className="tab-link">{inv.inventory_name}</a>
                    </li>
                );
            })}
        </ul>
    );
}
