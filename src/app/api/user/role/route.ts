import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { document } = await request.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('document', document)
      .single();

    if (error || !user) {
      return NextResponse.json({ role: null }, { status: 404 });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}