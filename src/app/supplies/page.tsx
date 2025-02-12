import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';
import { IconButton } from '@/src/components/IconButton/iconButton';

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
                        {supplies && supplies.map(supply => (
                            <tr key={supply.id}>
                                <td><span className="item-name">{supply.supply_name}</span></td>
                                <td></td>
                                <td>
                                    <div className="table-actions">
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" />
                                        <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />
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