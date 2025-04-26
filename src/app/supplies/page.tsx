import { createClient } from '@/src/utils/supabase/server';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { DeleteButton } from './delete/DeleteButton';
import { EditSupplyButton } from './edit/EditSupplyButton';
import { AddButton } from './add/AddButton';

export default async function SuppliesPage() {
    const supabase = await createClient();
    const { data: supplies } = await supabase
        .from("supplies")
        .select(`
            id,
            supply_name
        `).order('supply_name', { ascending: true });

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Supplies</h2>
                <AddButton/>
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
                        {supplies && supplies.map(supply => (
                            <tr key={supply.id}>
                                <td><span className="item-name">{supply.supply_name}</span></td>
                                <td>{/*supply.products ? supply.products.length : 0*/}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton supplyId={supply.id} />
                                        <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />
                                        <EditSupplyButton supplyId={supply.id} currentName={supply.supply_name} />
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