'use client'
import { useEffect, useMemo, useState } from 'react'
import { Question } from '@/types/survey'

export default function SurveyPage() {
  const [surveyId, setSurveyId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [otherText, setOtherText] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSurvey() {
      try {
        const res = await fetch('/api/survey')
        const { survey } = await res.json()
        setSurveyId(survey.id)
        setQuestions(survey.questions)
      } catch {
        setError('Could not load survey. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadSurvey()
  }, [])

  // Which questions are currently visible based on show_if conditions
  const visibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!q.show_if) return true
      const dependentAnswer = answers[q.show_if.question_id]
      return dependentAnswer && q.show_if.equals.includes(dependentAnswer)
    })
  }, [questions, answers])

  // Group visible questions by section, preserving order
  const sections = useMemo(() => {
    const map: { name: string; items: Question[] }[] = []
    for (const q of visibleQuestions) {
      let group = map.find(s => s.name === q.section)
      if (!group) {
        group = { name: q.section, items: [] }
        map.push(group)
      }
      group.items.push(q)
    }
    return map
  }, [visibleQuestions])

  function setAnswer(id: string, value: any) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function toggleMultiSelect(id: string, option: string) {
    setAnswers(prev => {
      const current: string[] = prev[id] ?? []
      const next = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option]
      return { ...prev, [id]: next }
    })
  }

  // Is this visible+required question answered?
  function isAnswered(q: Question) {
    if (q.required === false) return true
    const val = answers[q.id]
    if (q.type === 'multi_select') {
      if (!val || val.length === 0) return false
      if (val.includes('Other') && !otherText[q.id]?.trim()) return false
      return true
    }
    if (val === undefined || val === null || val === '') return false
    if (val === 'Other' && !otherText[q.id]?.trim()) return false
    return true
  }

  const requiredVisible = visibleQuestions.filter(q => q.required !== false)
  const answeredCount = requiredVisible.filter(isAnswered).length
  const progress = requiredVisible.length
    ? Math.round((answeredCount / requiredVisible.length) * 100)
    : 0
  const allAnswered = requiredVisible.every(isAnswered)

  // Build the final value to save for a question
  function finalValue(q: Question) {
    const val = answers[q.id]
    if (q.type === 'multi_select') {
      const arr: string[] = val ?? []
      return arr.map(v => (v === 'Other' ? `Other: ${otherText[q.id] ?? ''}` : v))
    }
    if (val === 'Other') return `Other: ${otherText[q.id] ?? ''}`
    return val ?? ''
  }

  function finalText(q: Question) {
    const v = finalValue(q)
    return Array.isArray(v) ? v.join(', ') : String(v ?? '')
  }

  async function handleSubmit() {
    if (!surveyId) return
    setSubmitting(true)

    try {
      let respondentId: string | null = null
      const toSave = visibleQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '')

      for (const q of toSave) {
        const apiRes: Response = await fetch('/api/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respondent_id: respondentId,
            survey_flow_id: surveyId,
            question_id: q.id,
            answer_text: finalText(q),
            answer_value: finalValue(q),
            channel: 'web',
            language: 'en'
          })
        })
        const data: { respondent_id?: string } = await apiRes.json()
        if (!respondentId && data.respondent_id) respondentId = data.respondent_id
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong submitting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Center><p style={{ color: '#666' }}>Loading survey...</p></Center>
  if (error) return <Center><p style={{ color: 'red' }}>{error}</p></Center>

  if (submitted) return (
    <Center>
      <div style={styles.thankyou}>
        <div style={styles.checkmark}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Thank you for your feedback</h2>
        <p style={{ color: '#555', fontSize: 15 }}>
          Your response has been recorded and will help shape policy dialogue at ADC.
        </p>
      </div>
    </Center>
  )

  return (
    <div style={styles.page}>
      {/* Sticky progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
        </div>
        <span style={styles.progressLabel}>{progress}% complete</span>
      </div>

      <div style={styles.header}>
        <p style={styles.headerLabel}>African Development Conference 2026</p>
        <h1 style={styles.headerTitle}>Event Feedback & Impact Survey</h1>
        <p style={styles.headerSub}>
          Your input directly informs policy dialogue and future ADC programming.
        </p>
      </div>

      <div style={styles.form}>
        {sections.map(section => (
          <div key={section.name} style={styles.sectionBlock}>
            <h3 style={styles.sectionHeader}>{section.name}</h3>

            {section.items.map(q => (
              <div key={q.id} style={styles.questionBlock}>
                <label style={styles.questionLabel}>
                  {q.text}
                  {q.required === false && <span style={styles.optionalTag}> (optional)</span>}
                </label>

                {(q.type === 'text') && (
                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    style={styles.input}
                  />
                )}

                {q.type === 'long_text' && (
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    rows={3}
                    style={styles.textarea}
                  />
                )}

                {q.type === 'mcq' && q.options && (
                  <div style={styles.optionGroup}>
                    {q.options.map(opt => (
                      <div key={opt}>
                        <button
                          type="button"
                          onClick={() => setAnswer(q.id, opt)}
                          style={{
                            ...styles.optionBtn,
                            ...(answers[q.id] === opt ? styles.optionBtnSelected : {})
                          }}
                        >
                          <span style={{
                            ...styles.optionDot,
                            ...(answers[q.id] === opt ? styles.optionDotSelected : {})
                          }} />
                          {opt}
                        </button>
                        {opt === 'Other' && answers[q.id] === 'Other' && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherText[q.id] ?? ''}
                            onChange={e => setOtherText(prev => ({ ...prev, [q.id]: e.target.value }))}
                            style={{ ...styles.input, marginTop: 6 }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'multi_select' && q.options && (
                  <div style={styles.optionGroup}>
                    {q.options.map(opt => {
                      const selected = (answers[q.id] ?? []).includes(opt)
                      return (
                        <div key={opt}>
                          <button
                            type="button"
                            onClick={() => toggleMultiSelect(q.id, opt)}
                            style={{
                              ...styles.optionBtn,
                              ...(selected ? styles.optionBtnSelected : {})
                            }}
                          >
                            <span style={{
                              ...styles.checkbox,
                              ...(selected ? styles.checkboxSelected : {})
                            }}>
                              {selected ? '✓' : ''}
                            </span>
                            {opt}
                          </button>
                          {opt === 'Other' && selected && (
                            <input
                              type="text"
                              placeholder="Please specify"
                              value={otherText[q.id] ?? ''}
                              onChange={e => setOtherText(prev => ({ ...prev, [q.id]: e.target.value }))}
                              style={{ ...styles.input, marginTop: 6 }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {q.type === 'rating' && (
                  <div>
                    <div style={styles.ratingRow}>
                      {Array.from(
                        { length: (q.scale_max! - q.scale_min! + 1) },
                        (_, i) => q.scale_min! + i
                      ).map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAnswer(q.id, num)}
                          style={{
                            ...styles.ratingBtn,
                            ...(answers[q.id] === num ? styles.ratingBtnSelected : {})
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div style={styles.ratingLabels}>
                      <span>{q.scale_min_label}</span>
                      <span>{q.scale_max_label}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          style={{
            ...styles.submitBtn,
            opacity: allAnswered && !submitting ? 1 : 0.45,
            cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback →'}
        </button>

        {!allAnswered && (
          <p style={styles.hint}>Please answer all required questions to submit.</p>
        )}
      </div>
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={styles.center}>{children}</div>
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(150deg, #0b2f1b, #0f3b22)',
    padding: '2rem 1rem 4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
    maxWidth: 620,
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: '#9be61a',
    transition: 'width 0.2s',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  header: {
    width: '100%',
    maxWidth: 620,
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  headerLabel: {
    color: '#9be61a',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  form: {
    width: '100%',
    maxWidth: 620,
    background: '#ffffff',
    borderRadius: 20,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingBottom: '1.5rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1f7a3a',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '0.5rem',
  },
  questionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  questionLabel: {
    fontSize: 14.5,
    fontWeight: 600,
    color: '#0b2f1b',
    lineHeight: 1.4,
  },
  optionalTag: {
    fontWeight: 400,
    color: '#94a3b8',
    fontSize: 13,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    color: '#0b2f1b',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    color: '#0b2f1b',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
  optionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    color: '#0b2f1b',
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  optionBtnSelected: {
    border: '1px solid #0b2f1b',
    background: '#f0fdf4',
  },
  optionDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    flexShrink: 0,
  },
  optionDotSelected: {
    border: '5px solid #0b2f1b',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '2px solid #cbd5e1',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
  },
  checkboxSelected: {
    background: '#0b2f1b',
    border: '2px solid #0b2f1b',
  },
  ratingRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  ratingBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#0b2f1b',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ratingBtnSelected: {
    background: '#0b2f1b',
    color: '#9be61a',
    border: '1px solid #0b2f1b',
  },
  ratingLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  submitBtn: {
    padding: '14px',
    background: '#0b2f1b',
    color: '#9be61a',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    width: '100%',
    marginTop: '1rem',
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
    marginTop: -8,
  },
  thankyou: {
    textAlign: 'center',
    maxWidth: 420,
    padding: '2rem',
  },
  checkmark: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#0b2f1b',
    color: '#9be61a',
    fontSize: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  }
}