'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/Button/button';
import { useToast } from '@/src/components/Toast/toast';
import styles from './profile.module.css';

type Props = {
  email: string;
  initialUsername: string;
};

export default function ProfileForm({ email, initialUsername }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const toast = useToast();
  const router = useRouter();

  const updateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile/updateUsername', {
      method: 'PUT',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.success) {
      toast('✅ Username updated!');
      router.refresh();
    } else {
      toast(`Error: ${result.error}`);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/profile/changePassword', {
      method: 'PUT',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.success) {
      toast('✅ Password updated!');
      setPassword('');
    } else {
      toast(`Error: ${result.error}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className="input-group">
        <label className="input-label">Email</label>
        <input type="email" value={email} readOnly />
      </div>

      <form onSubmit={updateUsername} className={styles.form}>
        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formAction}>
          <Button variant="primary" type="submit">Save username</Button>
        </div>
      </form>

      <form onSubmit={changePassword} className={styles.form}>
        <div className="input-group">
          <label className="input-label">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.formAction}>
          <Button variant="secondary" type="submit">Change password</Button>
        </div>
      </form>
    </div>
  );
}
