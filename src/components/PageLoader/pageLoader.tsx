import styles from './pageLoader.module.css';

export function PageLoader() {
    return (
        <div className={styles.container}>
            <div className={styles.spinner}></div>
            <span>Loading…</span>
        </div>
    );
}
