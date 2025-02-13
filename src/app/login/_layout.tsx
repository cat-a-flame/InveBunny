import styles from "./login.module.css";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={styles["login-page"]}>
                {children}
            </body>
        </html>
    );
}
