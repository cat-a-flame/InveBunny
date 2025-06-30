import { Button } from '../../../components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { EmptyState } from '../../../components/EmptyState/emptyState';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useEffect, useState, useRef } from 'react';
import AddProductBatchPanel from './AddProductBatchPanel';
import { ProductBatch } from './EditProductBatchPanel';
import DeleteProductBatchDialog from './DeleteProductBatchDialog';

interface Props {
    open: boolean;
    onClose: () => void;
    productId: string;
    onEditBatch?: (batch: ProductBatch) => void;
}

export default function ProductBatchPanel({ open, onClose, productId, onEditBatch }: Props) {
    const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
    const [productName, setProductName] = useState<string>('');
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteBatch, setDeleteBatch] = useState<{ id: string; p_batch_name: string } | null>(null);

    const refreshBatches = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/products/batches/?productId=${productId}`);
            const data = await response.json();
            if (data?.batches) {
                setProductBatches(data.batches);
            } else {
                console.error('No batches found or incorrect data structure');
            }
            setProductName(data?.productName || 'Unknown Product');
        } catch (error) {
            console.error('Error fetching product batches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            refreshBatches();
        }
    }, [open, productId]);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setTimeout(() => {
                setIsOpen(true);
            }, 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open, productId]);

    const activeBatches = productBatches.filter((batch) => batch.is_active);
    const archivedBatches = productBatches.filter((batch) => !batch.is_active);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.toLocaleString('en-GB', { month: 'long' });
        const year = date.getFullYear();
        const day = date.getDate();
        return `${year} ${month} ${day}.`;
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title">{productName}</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>

                <div className="side-panel-content">
                    {isLoading?(
                        <div className = "loading" >
                            <div className="loading-title"></div>
                            <div className="loading-batch"></div>
                            <div className="loading-batch"></div>
                            <div className="loading-batch"></div>
                        </div>
                    ) : activeBatches.length > 0 ? (
                <>
                    <h4 className="section-subtitle">Active batches</h4>

                    {activeBatches.map((batch) => (
                        <details className="batch-list-details" key={batch.id}>
                            <summary className="batch-list-header">
                                <div>
                                    <span className="batch-list-name">{batch.p_batch_name}</span>
                                    <span className="batch-list-date"> - {formatDate(batch.date_made)}</span>
                                </div>

                                <div className="table-actions">
                                    <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" onClick={() => setDeleteBatch({ id: batch.id, p_batch_name: batch.p_batch_name })} />
                                    <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" onClick={() => onEditBatch && onEditBatch(batch)} />
                                </div>
                            </summary>

                            <ul>
                                {batch.supplies?.map((s, index) => (
                                    <li key={index} className="batch-list-item">
                                        <span>{s.supplyName}</span> <span className="list-batch-name">{s.batchName}</span>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    ))}
                </>
                ) : (
                    <EmptyState
                        title="You have no product batches yet"
                        subtitle="Create a new batch to get started."
                        image="/images/empty-batch.svg">
                        <Button variant="primary" icon={<CgMathPlus />} onClick={() => setShowCreateDialog(true)}>Create new batch</Button>
                    </EmptyState>
                )}

                {archivedBatches.length > 0 ? (
                    <>
                        <h4 className="section-subtitle">Archived batches</h4>

                        {archivedBatches.map((batch) => (
                            <details className="batch-list-details" key={batch.id}>
                                <summary className="batch-list-header">
                                    <div>
                                        <span className="batch-list-name">{batch.p_batch_name}</span>
                                        <span className="batch-list-date"> - {formatDate(batch.date_made)}</span>
                                    </div>

                                    <div className="table-actions">
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" onClick={() => setDeleteBatch({ id: batch.id, p_batch_name: batch.p_batch_name })} />
                                        <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" onClick={() => onEditBatch && onEditBatch(batch)} />
                                    </div>
                                </summary>

                                <ul>
                                    {batch.supplies?.map((s, index) => (
                                        <li key={index} className="batch-list-item">
                                            <span>{s.supplyName}</span> <span className="list-batch-name">{s.batchName}</span>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ))}
                    </>
                ) : null}
            </div>

            {activeBatches.length > 0 ? (
                <div className="side-panel-footer">
                    <Button variant="primary" icon={<CgMathPlus />} onClick={() => setShowCreateDialog(true)}>Create new batch</Button>
                </div>
            ) : null}
        </div >

            { showCreateDialog && (
                <AddProductBatchPanel
                    open={true}
                    onClose={() => setShowCreateDialog(false)}
                    productId={productId}
                    productName={productName}
                    onCreated={() => {
                        refreshBatches();
                        setShowCreateDialog(false);
                    }}
                />
            )
}


{
    deleteBatch && (
        <DeleteProductBatchDialog
            open={true}
            onClose={() => setDeleteBatch(null)}
            batchId={deleteBatch.id}
            batchName={deleteBatch.p_batch_name}
            onDeleted={() => {
                refreshBatches();
                setDeleteBatch(null);
            }}
        />
    )
}
        </>
    );
}
