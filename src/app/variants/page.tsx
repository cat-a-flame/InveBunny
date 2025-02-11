import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';

export default async function VariantsPage() {
    const supabase = await createClient();
    const { data: variants } = await supabase
    .from("variants")
    .select(`
            id,
            variant_name
        `).order('variant_name', { ascending: true });

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Variants</h2>

            <AddButton />
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
                            <td>{variant.variant_name}</td>
                            <td></td>
                            <td>Delete | Batch | Edit</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    );
};