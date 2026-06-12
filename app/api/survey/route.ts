import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/survey?id=some-uuid   → returns that specific survey
// GET /api/survey                → returns the active survey
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    let query = supabaseAdmin.from('survey_flows').select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('active', true).order('created_at', { ascending: false })
    }

    const { data, error } = id
      ? await query.single()
      : await query.limit(1).single()

    if (error) throw error

    return NextResponse.json({ survey: data })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}