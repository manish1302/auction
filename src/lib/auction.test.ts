import { describe, expect, it } from 'vitest'
import { canBid, closeCurrentLot, createAuction, nextBidAmount, placeBid } from './auction'

describe('auction engine', () => {
  it('accepts the opening bid and applies the next increment', () => {
    const auction = createAuction()
    expect(nextBidAmount(auction)).toBe(200)
    const opened = placeBid(auction, 'coastal')
    expect(opened.highBid).toEqual({ teamId: 'coastal', amount: 200 })
    expect(nextBidAmount(opened)).toBe(250)
  })

  it('deducts the winning bid and adds the player to the roster', () => {
    const auction = createAuction()
    const bid = placeBid(auction, 'coastal')
    const sold = closeCurrentLot(bid)
    const coastal = sold.teams.find((team) => team.id === 'coastal')!
    expect(coastal.purse).toBe(9800)
    expect(coastal.roster).toHaveLength(1)
    expect(coastal.roster[0].name).toBe('Arjun Mehta')
  })

  it('rejects a bid when a squad is full', () => {
    const auction = createAuction({ initialPurse: 10000, minimumSquad: 0, maximumSquad: 1, maximumOverseas: 8, minimumBid: 200 })
    const full = { ...auction, teams: auction.teams.map((team) => team.id === 'coastal' ? { ...team, roster: [auction.queue[0]] } : team) }
    expect(canBid(full, 'coastal').ok).toBe(false)
    expect(canBid(full, 'coastal').reason).toContain('full')
  })

  it('preserves a reserve for required remaining squad places', () => {
    const auction = createAuction({ initialPurse: 400, minimumSquad: 2, maximumSquad: 25, maximumOverseas: 8, minimumBid: 200 })
    expect(canBid(auction, 'coastal', 250)).toEqual({ ok: false, reason: 'Purse reserve needed to complete the squad.' })
  })

  it('marks the auction complete after the final player is closed', () => {
    const auction = createAuction()
    const finalLot = { ...auction, queue: [auction.queue[0]], currentIndex: 0 }
    expect(closeCurrentLot(finalLot).status).toBe('COMPLETE')
  })
})
