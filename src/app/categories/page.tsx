import { AddButton } from '@/src/features/categories/add/AddButton';
import { DeleteButton } from '@/src/features/categories/delete/DeleteButton';
import { EditCategoryButton } from '@/src/features/categories/edit/EditCategoryButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '../../components/SearchBar/searchBar';
import { createClient } from '@/src/utils/supabase/server';
import styles from './categories.module.css';

export default async function CategoriesPage({ searchParams }: { searchParams: any }) {
    const supabase = await createClient();
    const params = await searchParams;

    // Pagination setup
    const page = parseInt(params.page || "1");
    const query = params.query || "";
    const pageSize = 12;

    const { data: categories, count } = await supabase
        .from("categories")
        .select("id, category_name, products(count)", { count: 'exact' })
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
                <div className="filter-bar single-search">
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
                                <td>{category.products ? category.products[0]?.count ?? 0 : 0}</td>
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

            <div className="pagination total-count">
                <div className={styles.summary}>
                    <div className={styles.total}>
                        Total <strong>{totalCount}</strong> categories
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
};