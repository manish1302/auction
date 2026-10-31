import type { AiPlan, AuctionState } from './types'

export async function requestClaudePlans(auction: AuctionState): Promise<Record<string, AiPlan>> {
  const response = await fetch('/api/ai/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: auction.config, teams: auction.teams, queue: auction.queue }),
  })
  const result = await response.json() as { plans?: AiPlan[]; error?: string }
  if (!response.ok || !result.plans) throw new Error(result.error || 'Claude could not prepare the team plans.')
  return Object.fromEntries(result.plans.map((plan) => [plan.teamId, plan]))
}
