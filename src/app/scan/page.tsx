import { Button } from '@/src/components/Button/button';
import styles from './scan.module.css';

export default async function ScanPage() {

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Scan items</h2>
            </div>

            <div className={styles["scanning-area"]}>
                <img src="/images/scan_barcode.png" className={styles["barcode-image"]} alt="Scan items" />

                <input type="text" className={styles["barcode-input"]} placeholder="Scan an item" />

                <div className={styles["scanned-items-list"]}>
                    <ul className={styles.list} id="scannedItemsList">
                        <li id="scanned-aaaa">Dachshund Valentine's Day card <span>1</span></li>
                        <li id="scanned-aaaa">Illustarted calendar 2025 <span>10</span></li>
                        <li id="scanned-aaaa">Pidgeon vinyl sticker <span>999</span></li>
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