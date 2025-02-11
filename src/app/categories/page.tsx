import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
    .from("categories")
    .select(`
            id,
            category_name
        `).order('category_name', { ascending: true });

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Categories</h2>

            <AddButton />
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
                            <td>{category.category_name}</td>
                            <td></td>
                            <td>Delete | Batch | Edit</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    );
};