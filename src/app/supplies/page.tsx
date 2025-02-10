import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';

export default async function SuppliesPage() {
    const supabase = await createClient();
    const { data: supplies } = await supabase
    .from("supplies")
    .select(`
            id,
            supply_name
        `).order('supply_name', { ascending: true });

    return (
        <main>
            <div className="pageHeader">
                <h2 className="heading-title">Supplies</h2>

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
                    {supplies && supplies.map(supply => (
                        <tr key={supply.id}>
                            <td>{supply.supply_name}</td>
                            <td></td>
                            <td>Delete | Batch | Edit</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </main>
    );
};