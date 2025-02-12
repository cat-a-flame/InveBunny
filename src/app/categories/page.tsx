import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';
import { IconButton } from '@/src/components/IconButton/iconButton';

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
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" />
                                        <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" />
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