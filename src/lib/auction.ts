import { createTeams, defaultConfig, players } from './data'
import type { AuctionConfig, AuctionState, Bid, Team } from './types'
export const getCurrentPlayer = (state: AuctionState) => state.queue[state.currentIndex] ?? null
export const getIncrement = (amount: number) => amount < 1000 ? 50 : amount < 2000 ? 100 : 200
export const nextBidAmount = (state: AuctionState) => { const player = getCurrentPlayer(state); return !player ? 0 : state.highBid ? state.highBid.amount + getIncrement(state.highBid.amount) : player.basePrice }
export const overseasCount = (team: Team) => team.roster.filter((player) => player.overseas).length
export const minimumReserve = (team: Team, config: AuctionConfig) => Math.max(0, config.minimumSquad - team.roster.length - 1) * config.minimumBid
export function canBid(state: AuctionState, teamId: string, amount = nextBidAmount(state)): { ok: boolean; reason?: string } {
  const team = state.teams.find((candidate) => candidate.id === teamId); const player = getCurrentPlayer(state)
  if (!team || !player || state.status !== 'BIDDING') return { ok: false, reason: 'Auction is not open for bidding.' }
  if (team.roster.length >= state.config.maximumSquad) return { ok: false, reason: 'Squad is already full.' }
  if (player.overseas && overseasCount(team) >= state.config.maximumOverseas) return { ok: false, reason: 'Overseas-player limit reached.' }
  if (state.highBid?.teamId === teamId) return { ok: false, reason: 'You already hold the high bid.' }
  if (amount < player.basePrice || (state.highBid && amount < state.highBid.amount + getIncrement(state.highBid.amount))) return { ok: false, reason: 'Bid does not meet the required increment.' }
  if (team.purse - amount < minimumReserve(team, state.config)) return { ok: false, reason: 'Purse reserve needed to complete the squad.' }
  return { ok: true }
}
export function createAuction(config: AuctionConfig = defaultConfig): AuctionState { return { config, teams: createTeams(config.initialPurse), queue: players, currentIndex: 0, highBid: null, status: 'BIDDING', activity: [`Auction opened. ${players[0].name} is on the podium.`], aiPlans: {} } }
export function placeBid(state: AuctionState, teamId: string, amount = nextBidAmount(state)): AuctionState { const verdict = canBid(state, teamId, amount); if (!verdict.ok) return { ...state, activity: [`Bid rejected: ${verdict.reason}`, ...state.activity] }; const team = state.teams.find((candidate) => candidate.id === teamId)!; return { ...state, highBid: { teamId, amount }, activity: [`${team.shortName} bid ₹${amount}L for ${getCurrentPlayer(state)!.name}.`, ...state.activity] } }
export function closeCurrentLot(state: AuctionState): AuctionState { const player = getCurrentPlayer(state); if (!player || state.status !== 'BIDDING') return state; let teams = state.teams; const result = state.highBid ? (() => { const winner = teams.find((team) => team.id === state.highBid!.teamId)!; teams = teams.map((team) => team.id === winner.id ? { ...team, purse: team.purse - state.highBid!.amount, roster: [...team.roster, player] } : team); return `${player.name} sold to ${winner.shortName} for ₹${state.highBid!.amount}L.` })() : `${player.name} remains unsold.`; const nextIndex = state.currentIndex + 1; const complete = nextIndex >= state.queue.length; return { ...state, teams, currentIndex: nextIndex, highBid: null, status: complete ? 'COMPLETE' : 'BIDDING', activity: [complete ? `${result} Auction complete.` : `${result} Next: ${state.queue[nextIndex].name}.`, ...state.activity] } }
export const restartAuction = (config: AuctionConfig = defaultConfig) => createAuction(config)
export const getBidLeader = (state: AuctionState): Team | undefined => state.teams.find((team) => team.id === state.highBid?.teamId)
export const bidLabel = (bid: Bid | null) => bid ? `₹${bid.amount}L` : 'Base price'
