import styles from './pageLoader.module.css';

export function PageLoader() {
    return (
        <div className={styles.loading}>
            <div className={styles.header}>
                <div className={styles.title}></div>
                <div className={styles.button}></div>
            </div>
            <div className={styles.row}></div>
            <div className={styles.row}></div>
            <div className={styles.row}></div>
            <div className={styles.row}></div>
            <div className={styles.row}></div>
            <div className={styles.row}></div>
        </div>
    );
}
