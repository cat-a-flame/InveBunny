import { AddButton } from './add/AddButton';
import { DeleteButton } from './delete/DeleteButton';
import { EditCategoryButton } from './edit/EditCategoryButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '../../components/SearchBar/searchBar';
import { createClient } from '@/src/utils/supabase/server';

type SearchParams = {
    page?: string;
    query?: string;
};

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient();

    // Pagination setup
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const query = resolvedSearchParams.query || "";
    const pageSize = 12;

    const { data: categories, count } = await supabase
        .from("categories")
        .select("id, category_name, products (id)", { count: 'exact' })
        .ilike('category_name', `%${query}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('category_name', { ascending: true });

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Categories</h2>
                <AddButton />
            </div>

            <div className="content">
                <div className="filter-bar">
                    <Search placeholder="Search for category name" query={query} />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Category name</th>
                            <th># assigned products</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories && categories.map(category => (
                            <tr key={category.id}>
                                <td><span className="item-name">{category.category_name}</span></td>
                                <td>{category.products ? category.products.length : 0}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton categoryId={category.id} categoryName={category.category_name} />
                                        <EditCategoryButton categoryId={category.id} currentName={category.category_name} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
};