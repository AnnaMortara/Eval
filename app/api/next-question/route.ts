import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { Question } from '@/types/survey'

export async function POST(req: NextRequest) {
  try {
    const { survey_flow_id, current_question_id, answer_value } = await req.json()

    if (!survey_flow_id || !current_question_id) {
      return NextResponse.json(
        { error: 'survey_flow_id and current_question_id are required' },
        { status: 400 }
      )
    }

    // Load the survey flow
    const { data: flow, error } = await supabaseAdmin
      .from('survey_flows')
      .select('questions')
      .eq('id', survey_flow_id)
      .single()

    if (error) throw error

    const questions = flow.questions as Question[]
    const current = questions.find(q => q.id === current_question_id)

    if (!current) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Check conditions first, fall back to default_next
    let next_id = current.default_next

    for (const condition of current.conditions ?? []) {
      if (condition.answer === answer_value) {
        next_id = condition.next
        break
      }
    }

    // null next_id means the survey is complete
    if (!next_id) {
      return NextResponse.json({ next_question: null, complete: true })
    }

    const next = questions.find(q => q.id === next_id) ?? null
    return NextResponse.json({ next_question: next, complete: false })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}