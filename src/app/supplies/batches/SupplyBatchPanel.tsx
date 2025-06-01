import { Button } from '../../../components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useEffect, useState } from 'react';
import AddBatchDialog from './AddBatchDialog';
import EditBatchDialog from './EditBatchDialog';
import DeleteBatchDialog from './DeleteBatchDialog';

type SupplyBatch = {
    id: string;
    supplier_name: string;
    order_date: string;
    vendor_name: string;
    order_id: string;
    batch_name: string;
    status: boolean;
};

type SupplyBatchDialogProps = {
    open: boolean;
    onClose: () => void;
    supplyId: string;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    const day = date.getDate();

    return `${year} ${month} ${day}.`;
};

export default function SupplyBatchDialog({ open, onClose, supplyId }: SupplyBatchDialogProps) {
    const [supplyBatches, setSupplyBatches] = useState<SupplyBatch[]>([]);
    const [supplyName, setSupplyName] = useState<string>('');
    const [_isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editBatch, setEditBatch] = useState<SupplyBatch | null>(null);
    const [deleteBatch, setDeleteBatch] = useState<{ id: string; batch_name: string } | null>(null);

    const refreshBatches = async () => {
        try {
            const response = await fetch(`/api/supplies/batches/?supplyId=${supplyId}`);
            const data = await response.json();

            if (data?.batches) {
                setSupplyBatches(data.batches);
            } else {
                console.error('No batches found or incorrect data structure');
            }

            setSupplyName(data?.supplyName || 'Unknown Supply');
        } catch (error) {
            console.error('Error fetching supply batches:', error);
        }
    };


    // Fetch supply batches and supply name when dialog opens
    useEffect(() => {
        if (open) {
            const fetchSupplyBatches = async () => {
                try {
                    const response = await fetch(`/api/supplies/batches/?supplyId=${supplyId}`);
                    const data = await response.json();

                    if (data?.batches) {
                        setSupplyBatches(data.batches);
                    } else {
                        console.error('No batches found or incorrect data structure');
                    }

                    setSupplyName(data?.supplyName || 'Unknown Supply');
                } catch (error) {
                    console.error('Error fetching supply batches:', error);
                }
            };

            refreshBatches();
            fetchSupplyBatches();
        }
    }, [open, supplyId]);

    useEffect(() => {
        if (open) {
            setIsMounted(true);
            setTimeout(() => {
                setIsOpen(true);
            }, 50);
        } else {
            setIsOpen(false);
        }
    }, [open, supplyId]);

    const activeBatches = supplyBatches.filter((batch) => batch.status);
    const archivedBatches = supplyBatches.filter((batch) => !batch.status);

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title">{supplyName}</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>

                <div className="side-panel-content">
                    {activeBatches.length > 0 ? (
                        <>
                            <h4 className="section-subtitle">Active batches</h4>
                            <table className="batch-list">
                                <thead>
                                    <tr>
                                        <th>Batch name</th>
                                        <th>Supplier name<br/> Order date</th>
                                        <th>Vendor name<br /> Order number</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeBatches.map((supplyBatch) => (
                                        <tr key={supplyBatch.id}>
                                            <td><span className="item-name">{supplyBatch.batch_name}</span></td>

                                            <td>
                                                <span className="item-details">{supplyBatch.supplier_name}</span>
                                                <span className="item-sku">{formatDate(supplyBatch.order_date)}</span>
                                            </td>
                                            <td>
                                                <span className="item-details">{supplyBatch.vendor_name}</span>
                                                <span className="item-sku">{supplyBatch.order_id}</span>
                                            </td>
                                            <td className="table-actions">
                                                <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" onClick={() => setDeleteBatch({ id: supplyBatch.id, batch_name: supplyBatch.batch_name })} />
                                                <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" onClick={() => setEditBatch(supplyBatch)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>No active batches yet.</p>
                    )}

                    {archivedBatches.length > 0 ? (
                        <>
                            <h4 className="section-subtitle">Archived batches</h4>
                            <table className="batch-list">
                                <thead>
                                    <tr>
                                        <th>Batch name</th>
                                        <th>Supplier name<br/> Order date</th>
                                        <th>Vendor name<br/> Order number</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedBatches.map((supplyBatch) => (
                                        <tr key={supplyBatch.id}>
                                            <td><span className="item-name">{supplyBatch.batch_name}</span></td>

                                            <td>
                                                <span className="item-details">{supplyBatch.supplier_name}</span>
                                                <span className="item-sku">{formatDate(supplyBatch.order_date)}</span>
                                            </td>
                                            <td>
                                                <span className="item-details">{supplyBatch.vendor_name}</span>
                                                <span className="item-sku">{supplyBatch.order_id}</span>
                                            </td>
                                            <td className="table-actions">
                                                <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" onClick={() => setDeleteBatch({ id: supplyBatch.id, batch_name: supplyBatch.batch_name })} />
                                                <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" onClick={() => setEditBatch(supplyBatch)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : null}
                </div>

                <div className="side-panel-footer">
                    <Button variant="primary" icon={<CgMathPlus />} onClick={() => setShowCreateDialog(true)}>Create new batch</Button>
                </div>
            </div>

            {showCreateDialog && (
                <AddBatchDialog
                    open={true}
                    onClose={() => setShowCreateDialog(false)}
                    supplyId={supplyId}
                    supplyName={supplyName}
                    onCreated={() => {
                        refreshBatches();
                        setShowCreateDialog(false);
                    }}
                />
            )}

            {editBatch && (
                <EditBatchDialog
                    open={true}
                    onClose={() => setEditBatch(null)}
                    batch={editBatch}
                    onUpdated={() => {
                        refreshBatches();
                        setEditBatch(null);
                    }}
                />
            )}

            {deleteBatch && (
                <DeleteBatchDialog
                    open={true}
                    onClose={() => setDeleteBatch(null)}
                    batchId={deleteBatch.id}
                    batchName={deleteBatch.batch_name}
                    onDeleted={() => {
                        refreshBatches();
                        setDeleteBatch(null);
                    }}
                />
            )}
        </>
    );
}