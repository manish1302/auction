export type Role = 'BAT' | 'BOWL' | 'AR' | 'WK'
export type AuctionStatus = 'BIDDING' | 'SOLD' | 'UNSOLD' | 'COMPLETE'
export interface Player { id: string; name: string; role: Role; country: string; overseas: boolean; basePrice: number; rating: number; specialty: string }
export interface Team { id: string; name: string; shortName: string; owner: string; color: string; purse: number; roster: Player[]; isHuman: boolean }
export interface AuctionConfig { initialPurse: number; minimumSquad: number; maximumSquad: number; maximumOverseas: number; minimumBid: number }
export interface Bid { teamId: string; amount: number }
export interface AiPlan { teamId: string; summary: string; rolePriorities: Role[]; targetPlayerIds: string[]; valuations: Record<string, number>; source: 'claude' | 'local' }
export interface AuctionState { config: AuctionConfig; teams: Team[]; queue: Player[]; currentIndex: number; highBid: Bid | null; status: AuctionStatus; activity: string[]; aiPlans: Record<string, AiPlan> }
