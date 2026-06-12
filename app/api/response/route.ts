import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      respondent_id,
      survey_flow_id,
      question_id,
      answer_text,
      answer_value
    } = body

    // Validate required fields
    if (!survey_flow_id || !question_id) {
      return NextResponse.json(
        { error: 'survey_flow_id and question_id are required' },
        { status: 400 }
      )
    }

    // If no respondent_id, create a new anonymous respondent
    let finalRespondentId = respondent_id
    if (!finalRespondentId) {
      const { data: newRespondent, error: rErr } = await supabaseAdmin
        .from('respondents')
        .insert({
          channel: body.channel ?? 'web',
          language: body.language ?? 'en',
          metadata: {}
        })
        .select()
        .single()

      if (rErr) throw rErr
      finalRespondentId = newRespondent.id
    }

    // Save the response
    const { data, error } = await supabaseAdmin
      .from('responses')
      .insert({
        respondent_id: finalRespondentId,
        survey_flow_id,
        question_id,
        answer_text,
        answer_value
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      response: data,
      respondent_id: finalRespondentId
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}