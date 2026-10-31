import Anthropic from '@anthropic-ai/sdk'
import express from 'express'

const app = express()
const port = Number(process.env.PORT || 8787)
const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY), model })
})

function textFromMessage(message) {
  return message.content.filter((block) => block.type === 'text').map((block) => block.text).join('')
}

function parsePlan(text, validPlayerIds) {
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error('Claude did not return a strategy object.')
  const plan = JSON.parse(json)
  if (typeof plan.summary !== 'string' || !Array.isArray(plan.rolePriorities) || !Array.isArray(plan.targetPlayerIds) || !plan.valuations || typeof plan.valuations !== 'object') throw new Error('Claude returned an invalid strategy shape.')
  const valuations = Object.fromEntries(Object.entries(plan.valuations).filter(([playerId, value]) => validPlayerIds.has(playerId) && typeof value === 'number' && Number.isFinite(value)).map(([playerId, value]) => [playerId, Math.max(0, Math.round(value))]))
  return { summary: plan.summary.slice(0, 240), rolePriorities: plan.rolePriorities.filter((role) => ['BAT', 'BOWL', 'AR', 'WK'].includes(role)).slice(0, 4), targetPlayerIds: plan.targetPlayerIds.filter((id) => validPlayerIds.has(id)).slice(0, 5), valuations }
}

app.post('/api/ai/plan', async (request, response) => {
  if (!process.env.ANTHROPIC_API_KEY) return response.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured on the local server.' })
  const { config, teams, queue } = request.body ?? {}
  if (!config || !Array.isArray(teams) || !Array.isArray(queue)) return response.status(400).json({ error: 'Invalid auction planning request.' })
  const aiTeams = teams.filter((team) => team && !team.isHuman)
  if (aiTeams.length !== 7) return response.status(400).json({ error: 'Expected exactly seven AI franchises.' })
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const validPlayerIds = new Set(queue.map((player) => player.id))
  const auctionBrief = JSON.stringify({ config, queue, teams: teams.map(({ id, name, shortName, purse, roster, isHuman }) => ({ id, name, shortName, purse, roster, isHuman })) })
  const planForTeam = async (team) => {
    const message = await client.messages.create({
      model,
      max_tokens: 1400,
      system: 'You are the cricket director for one IPL-style franchise. Produce a concise public auction strategy, not hidden reasoning. You must respect squad, purse, overseas, and role-balance constraints. Return only a JSON object matching the requested fields. Prices are in lakh rupees. Your valuations must be realistic maximum bids, not recommendations to spend the full purse.',
      messages: [{ role: 'user', content: `Auction data:\n${auctionBrief}\n\nYou control this AI franchise:\n${JSON.stringify(team)}\n\nPlan the whole auction before it begins. Return JSON exactly in this form:\n${JSON.stringify({ summary: 'one sentence', rolePriorities: ['BAT', 'BOWL'], targetPlayerIds: ['p1'], valuations: { p1: 700, p2: 450 } })}\nProvide a valuation for every player id in the queue.` }],
    })
    return { teamId: team.id, ...parsePlan(textFromMessage(message), validPlayerIds), source: 'claude' }
  }
  try {
    const plans = await Promise.all(aiTeams.map(planForTeam))
    response.json({ plans, model })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Claude strategy request failed.'
    response.status(502).json({ error: message })
  }
})

app.listen(port, () => console.log(`AI strategy server listening on http://localhost:${port}`))
