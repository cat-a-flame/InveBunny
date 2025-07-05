import { AddButton } from '@/src/features/inventories/add/AddButton';
import { DeleteButton } from '@/src/features/inventories/delete/DeleteButton';
import { EditInventoryButton } from '@/src/features/inventories/edit/EditInventoryButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '@/src/components/SearchBar/searchBar';
import { createClient } from '@/src/utils/supabase/server';
import styles from './inventories.module.css';

export default async function InventoriesPage({ searchParams }: { searchParams: any }) {
    const supabase = await createClient();
    const params = await searchParams;

    const page = parseInt(params.page || '1');
    const query = params.query || '';
    const pageSize = 12;

    const { data: inventories, count } = await supabase
        .from('inventories')
        .select('id, inventory_name, product_inventories(count)', { count: 'exact' })
        .ilike('inventory_name', `%${query}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('inventory_name', { ascending: true });

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Inventories</h2>
                <AddButton />
            </div>

            <div className="content">
                <div className="filter-bar single-search">
                    <Search placeholder="Search for inventory name" query={query} />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Inventory name</th>
                            <th># stored products</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventories && inventories.map(inv => {
                            const productCount = inv.product_inventories ? inv.product_inventories[0]?.count ?? 0 : 0;
                            return (
                                <tr key={inv.id}>
                                    <td><span className="item-name">{inv.inventory_name}</span></td>
                                    <td>{productCount}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteButton inventoryId={inv.id} inventoryName={inv.inventory_name} productCount={productCount} />
                                            <EditInventoryButton inventoryId={inv.id} currentName={inv.inventory_name} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination total-count">
                <div className={styles.summary}>
                    <div className={styles.total}>
                        Total <strong>{totalCount}</strong> inventories
                    </div>
                </div>
                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
}
