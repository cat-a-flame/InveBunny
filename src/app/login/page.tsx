import { Button } from '@/src/components/Button/button'
import { login, signup } from './actions'
import styles from './login.module.css'

export default function LoginPage() {
    return (
        <div className={styles["login-page"]}>
            <form className={styles["login-form"]}>
                <h4>🐰 Invebunny</h4>
                <div className="input-group">
                    <label className="input-label" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required />
                </div>

                <Button variant="primary" formAction={login}>Log in</Button>
                <Button variant="ghost" formAction={signup}>Sign up</Button>

            </form>
        </div>
    )
}