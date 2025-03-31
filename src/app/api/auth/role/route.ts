import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { document } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('document', document)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}