import type { AuctionState } from './types'
const key = 'ipl-auction-simulator-v1'
export const saveAuction = (state: AuctionState) => localStorage.setItem(key, JSON.stringify(state))
export const loadAuction = (): AuctionState | null => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as AuctionState : null } catch { return null } }
export const clearAuction = () => localStorage.removeItem(key)
