import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Company, KPI, Player, ScoreResult } from './types'
import { calculateScore } from './utils'

const DEFAULT_SCORE = 7

function getDefaultScoreResult(
  kpiPriority: number,
  contributionType: 'direct' | 'indirect'
): ScoreResult {
  return {
    impact_score: DEFAULT_SCORE,
    effort_score: DEFAULT_SCORE,
    time_value_score: DEFAULT_SCORE,
    total_score: calculateScore(DEFAULT_SCORE, DEFAULT_SCORE, DEFAULT_SCORE, kpiPriority, contributionType),
    feedback: 'Good contribution to the team effort. Keep logging daily to build up your score.',
    improvement_tip: 'Add more detail to your task descriptions for better AI-powered scoring.',
  }
}

export async function scoreTask(params: {
  company: Company
  kpi: KPI | null
  player: Player
  taskTitle: string
  taskDescription: string | null
  contributionType: 'direct' | 'indirect'
  timeSpentHours: number
}): Promise<ScoreResult> {
  const { company, kpi, player, taskTitle, taskDescription, contributionType, timeSpentHours } = params
  const kpiPriority = kpi?.priority ?? 3

  if (!process.env.GEMINI_API_KEY) {
    return getDefaultScoreResult(kpiPriority, contributionType)
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
    })

    const kpiContext = kpi
      ? `KPI: "${kpi.title}" — ${kpi.description ?? ''}\nKPI Priority: #${kpi.priority} (${kpi.priority === 1 ? 'CRITICAL' : kpi.priority === 2 ? 'HIGH' : 'MEDIUM'})`
      : 'No specific KPI assigned — general company work'

    const prompt = `You are a startup performance analyst. Score this work task concisely.

COMPANY: ${company.name}
STAGE: ${company.state}
DESCRIPTION: ${company.description ?? 'A startup'}

${kpiContext}

PLAYER: ${player.name}
TASK: ${taskTitle}
DETAILS: ${taskDescription ?? 'No additional details'}
CONTRIBUTION: ${contributionType} contribution to KPI
TIME SPENT: ${timeSpentHours} hours

Score each dimension from 1-10 (decimals allowed):

1. impact_score: How much does this task move the needle on the KPI? Consider leverage and measurability.
2. effort_score: Intellectual/creative work required. Consider complexity and expertise needed.
3. time_value_score: Value of human time invested. Score lower if task was not a priority, but a lot of time was invested. Score lower if a task was given more time than it required.
   - HIGH (8-10): Strategic decisions, client relationships, creative problem-solving, novel R&D, complex negotiations
   - MEDIUM (4-7): Technical implementation, analysis, planning, coordination
   - LOW (1-3): Data entry, repetitive formatting, simple tasks easily done by AI/automation

Return ONLY valid JSON, no markdown:
{"impact_score":7,"effort_score":7,"time_value_score":7,"feedback":"2-3 sentence assessment.","improvement_tip":"One specific actionable suggestion."}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    const impact = Math.min(10, Math.max(1, Number(parsed.impact_score) || DEFAULT_SCORE))
    const effort = Math.min(10, Math.max(1, Number(parsed.effort_score) || DEFAULT_SCORE))
    const timeValue = Math.min(10, Math.max(1, Number(parsed.time_value_score) || DEFAULT_SCORE))

    return {
      impact_score: impact,
      effort_score: effort,
      time_value_score: timeValue,
      total_score: calculateScore(impact, effort, timeValue, kpiPriority, contributionType),
      feedback: parsed.feedback || 'Good work!',
      improvement_tip: parsed.improvement_tip || 'Keep it up!',
    }
  } catch (err) {
    console.error('Gemini scoring error:', err)
    return getDefaultScoreResult(kpiPriority, contributionType)
  }
}

export async function suggestKPIs(company: Company, existingKPIs: KPI[]): Promise<{
  analysis: Array<{ kpi: string; evaluation: string; comment: string }>
  suggestions: Array<{ title: string; description: string; why: string }>
}> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      analysis: [],
      suggestions: [
        { title: 'Monthly Recurring Revenue (MRR)', description: 'Track monthly subscription or recurring revenue', why: 'Core north-star metric for most startups' },
        { title: 'Weekly Active Users', description: 'Count of users who take a key action weekly', why: 'Measures product-market fit and engagement' },
        { title: 'Customer Acquisition Cost (CAC)', description: 'Total sales & marketing spend / new customers', why: 'Essential for understanding unit economics' },
      ],
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
    })

    const kpiList = existingKPIs.map(k => `- ${k.title}: ${k.description ?? ''} (target: ${k.target_value}${k.unit})`).join('\n')

    const prompt = `You are an expert startup advisor who knows YC, First Round, a16z, and startup best practices deeply.

COMPANY: ${company.name}
STAGE: ${company.state}
DESCRIPTION: ${company.description ?? 'A startup'}

CURRENT KPIs:
${kpiList || '(none set yet)'}

Task:
1. Evaluate each current KPI for appropriateness at this stage (appropriate/too_ambitious/not_right_stage/good_but_adjust)
2. Suggest 3 SPECIFIC KPIs from startup best practices (AARRR, OKRs, north star metrics) that fit this stage
3. Be concise and actionable — reference real startup frameworks

Return ONLY valid JSON, no markdown:
{"analysis":[{"kpi":"KPI name","evaluation":"appropriate","comment":"Brief comment"}],"suggestions":[{"title":"KPI Title","description":"What to measure","why":"Why it fits this stage"}]}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    
    // Ensure suggestions array exists and has items
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      console.warn('Gemini returned invalid suggestions structure:', parsed)
      return { 
        analysis: parsed.analysis || [], 
        suggestions: [] 
      }
    }
    
    return parsed
  } catch (err) {
    console.error('Gemini KPI suggestion error:', {
      message: err instanceof Error ? err.message : String(err),
      error: err
    })
    return { analysis: [], suggestions: [] }
  }
}
