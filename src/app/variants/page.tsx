import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from '@/src/features/variants/add/AddButton';
import { DeleteButton } from '@/src/features/variants/delete/DeleteButton';
import { EditVariantButton } from '@/src/features/variants/edit/EditVariantButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { Search } from '../../components/SearchBar/searchBar';
import styles from './variants.module.css';

export default async function VariantsPage({ searchParams }: { searchParams: any }) {
    const supabase = await createClient();
    const params = await searchParams;

    // Pagination setup
    const page = parseInt(params.page || "1");
    const query = params.query || "";
    const pageSize = 12;

    const { data: variants, count } = await supabase
        .from("variants")
        .select(`id, variant_name, products(count)`, { count: 'exact' })
        .ilike('variant_name', `%${query}%`)
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('variant_name', { ascending: true });

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Variants</h2>
                <AddButton />
            </div>

            <div className="content">
                <div className="filter-bar single-search">
                    <Search placeholder="Search for variant name" query={query} />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Supply name</th>
                            <th># assigned products</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants && variants.map(variant => (
                            <tr key={variant.id}>
                                <td><span className="item-name">{variant.variant_name}</span></td>
                                <td>{variant.products ? variant.products[0]?.count ?? 0 : 0}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton variantId={variant.id} variantName={variant.variant_name} />
                                        <EditVariantButton variantId={variant.id} currentName={variant.variant_name} />
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
                        Total <strong>{totalCount}</strong> variants
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
};