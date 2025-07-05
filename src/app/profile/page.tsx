import { createClient } from '@/src/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Profile</h2>
            </div>
            <div className="content">
                <ProfileForm email={user.email ?? ''} initialUsername={data?.username ?? ''} />
            </div>
        </>
    );
}
