import { createClient } from '@/src/utils/supabase/server';
import { DeleteButton } from './delete/DeleteButton';
import { EditCategoryButton } from './edit/EditCategoryButton';
import { AddButton } from './add/AddButton';

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
    .from("categories")
    .select(`
            id,
            category_name,
            products (id)
        `).order('category_name', { ascending: true });

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Categories</h2>
                <AddButton />
            </div>
            
            <div className="content">
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
                                        <DeleteButton categoryId={category.id} />
                                        <EditCategoryButton categoryId={category.id} currentName={category.category_name} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};