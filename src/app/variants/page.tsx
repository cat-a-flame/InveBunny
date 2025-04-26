import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './add/AddButton';
import { DeleteButton } from './delete/DeleteButton';
import { EditVariantButton } from './edit/EditVariantButton';

export default async function VariantsPage() {
    const supabase = await createClient();
    const { data: variants } = await supabase
    .from("variants")
    .select(`
            id,
            variant_name,
            products (id)
        `).order('variant_name', { ascending: true });

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Variants</h2>
                <AddButton />
            </div>
            
            <div className="content">
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
                                <td>{variant.products ? variant.products.length : 0}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton variantId={variant.id} />
                                        <EditVariantButton variantId={variant.id} currentName={variant.variant_name} />
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