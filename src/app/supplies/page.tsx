import { AddButton } from '@/src/features/supplies/add/AddButton';
import { DeleteButton } from '@/src/features/supplies/delete/DeleteButton';
import { EditSupplyButton } from '@/src/features/supplies/edit/EditSupplyButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '../../components/SearchBar/searchBar';
import { ViewBatchButton } from '@/src/features/supplies/batches/ViewBatchButton';
import { createClient } from '@/src/utils/supabase/server';
import { SettingsButton } from '@/src/features/supplyCategories/SettingsButton';
import { CategoryFilter } from '@/src/features/supplies/CategoryFilter';
import styles from './supplies.module.css';

export default async function SuppliesPage({ searchParams }: { searchParams: any }) {
    const supabase = await createClient();
    const params = await searchParams;

    const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
    const queryParam = Array.isArray(params.query) ? params.query[0] : params.query;
    const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;

    const parsedPage = parseInt(pageParam || "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const query = queryParam || "";
    const selectedCategoryId = categoryParam || "";
    const pageSize = 12;

    const { data: supplyCategories = [] } = await supabase
        .from('supply_categories')
        .select('id, category_name')
        .order('category_name', { ascending: true });

    let queryBuilder = supabase
        .from('supplies')
        .select(
            `id,
            supply_name,
            supply_quantity,
            supply_category_id,
            supply_categories(id, category_name)`,
            { count: 'exact' }
        )
        .ilike('supply_name', `%${query}%`);

    if (selectedCategoryId) {
        queryBuilder = queryBuilder.eq('supply_category_id', selectedCategoryId);
    }

    const { data: supplies, count } = await queryBuilder
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('supply_name', { ascending: true });

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Supplies</h2>
                <AddButton />
            </div>


            <div className="content">
                <div className="filter-bar supplies-filter-bar single-search">
                    <div className="filter-bar-options">
                        <div className="filter-bar-wrapper">
                            <Search placeholder="Search for supply name" query={query} />
                            <CategoryFilter
                                categories={supplyCategories.map(category => ({
                                    id: category.id,
                                    category_name: category.category_name,
                                }))}
                                selectedCategoryId={selectedCategoryId}
                            />
                        </div>
                        <SettingsButton />
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Supply name</th>
                            <th>Quantity</th>
                            <th>Supply category</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {supplies && supplies.map(supply => (
                            <tr key={supply.id}>
                                <td><span className="item-name">{supply.supply_name}</span></td>
                                <td>
                                    <span className="item-name">{supply.supply_quantity ?? 0}</span>
                                </td>
                                <td>
                                    <div className="category-badge">
                                        {(supply.supply_categories as any)?.category_name}
                                    </div>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton supplyId={supply.id} supplyName={supply.supply_name} />
                                        <ViewBatchButton supplyId={supply.id} />
                                        <EditSupplyButton
                                            supplyId={supply.id}
                                            currentName={supply.supply_name}
                                            currentCategoryId={supply.supply_category_id}
                                            currentQuantity={supply.supply_quantity}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination total-count">
                <div className={styles.summary}>
                    <div className={styles.total}>
                        Total <strong>{totalCount}</strong> supplies
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
};
