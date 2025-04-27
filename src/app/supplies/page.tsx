import { AddButton } from './add/AddButton';
import { DeleteButton } from './delete/DeleteButton';
import { EditSupplyButton } from './edit/EditSupplyButton';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '../../components/SearchBar/searchBar';
import { createClient } from '@/src/utils/supabase/server';

type SearchParams = {
    page?: string;
    query?: string;
};

export default async function SuppliesPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient();

    // Await searchParams before accessing
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const query = resolvedSearchParams.query || "";
    const pageSize = 12;

    // Query builder (as you already have it)
    const { data: supplies, count } = await supabase
        .from("supplies")
        .select("id, supply_name, supply_category", { count: 'exact' })
        .or(`supply_name.ilike.%${query}%,supply_category.ilike.%${query}%`)
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
                <Search placeholder="Search for supply name or category" query={query} />

                <table>
                    <thead>
                        <tr>
                            <th>Supply name</th>
                            <th>Supply category</th>
                            <th># assigned products</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {supplies && supplies.map(supply => (
                            <tr key={supply.id}>
                                <td><span className="item-name">{supply.supply_name}</span></td>
                                <td>
                                    <div className="category-badge">
                                        {supply.supply_category}
                                    </div>
                                </td>
                                <td>{/*supply.products ? supply.products.length : 0*/}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton supplyId={supply.id} />
                                        <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />
                                        <EditSupplyButton supplyId={supply.id} currentName={supply.supply_name} currentCategory={supply.supply_category} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination totalPages={totalPages} currentPage={page} />
        </>
    );
};
