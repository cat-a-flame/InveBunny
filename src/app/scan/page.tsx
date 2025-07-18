import { Button } from '@/src/components/Button/button';
import Image from 'next/image';
import styles from './scan.module.css';

export default async function ScanPage() {

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Scan items</h2>
            </div>

            <div className={styles["scanning-area"]}>
                <Image src="/images/scan_barcode.png" alt="Scan items" className={styles["barcode-image"]} width={200} height={200} />

                <input type="text" className={styles["barcode-input"]} placeholder="Scan an item" />

                <div className={styles["scanned-items-list"]}>
                    <ul className={styles.list} id="scannedItemsList">
                        <li className={styles.item}>Dachshund Valentine Day card <span className={styles.counter}>1</span></li>
                        <li className={styles.item}>Illustarted calendar 2025 <span className={styles.counter}>10</span></li>
                        <li className={styles.item}>Pidgeon vinyl sticker <span className={styles.counter}>999</span></li>
                    </ul>

                    <div className={styles["total-scanned-items"]}>
                        <span>Total scanned items:</span>
                        1010
                    </div>
                </div>

                <Button variant="secondary" className={styles["reset-button"]}>Reset list</Button>
            </div>
        </>
    );
};
