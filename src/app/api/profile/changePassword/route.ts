import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  if (!newPassword || newPassword.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'New password is required' },
      { status: 400 },
    );
  }

  // verify current password before allowing update
  if (!currentPassword) {
    return NextResponse.json(
      { success: false, error: 'Current password is required' },
      { status: 400 },
    );
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json(
      { success: false, error: 'Current password is incorrect' },
      { status: 400 },
    );
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
