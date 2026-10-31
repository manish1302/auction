import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { chooseAiBidder, maxValuation } from './lib/ai'
import { bidLabel, closeCurrentLot, createAuction, getBidLeader, getCurrentPlayer, nextBidAmount, placeBid } from './lib/auction'
import { clearAuction, loadAuction, saveAuction } from './lib/storage'
import { requestClaudePlans } from './lib/claude'
import type { AuctionConfig, AuctionState } from './lib/types'

const roles = { BAT: 'BATTER', BOWL: 'BOWLER', AR: 'ALL-ROUNDER', WK: 'WICKETKEEPER' }

function App() {
  const [auction, setAuction] = useState<AuctionState>(() => loadAuction() ?? createAuction())
  const [rules, setRules] = useState<AuctionConfig>(() => (loadAuction() ?? createAuction()).config)
  const [showQueue, setShowQueue] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [planning, setPlanning] = useState(false)
  const [planStatus, setPlanStatus] = useState('Local strategy engine active')
  const player = getCurrentPlayer(auction)
  const human = auction.teams.find((team) => team.isHuman)!
  const leader = getBidLeader(auction)
  const nextBid = nextBidAmount(auction)
  const progress = `${Math.min(auction.currentIndex + 1, auction.queue.length)} / ${auction.queue.length}`

  useEffect(() => { saveAuction(auction) }, [auction])

  const aiBid = () => {
    const bidder = chooseAiBidder(auction)
    if (bidder) setAuction((current) => placeBid(current, bidder.id))
  }
  const handleHumanBid = () => {
    if (aiThinking || !player) return
    setAuction((current) => placeBid(current, human.id))
    setAiThinking(true)
    window.setTimeout(() => { aiBid(); setAiThinking(false) }, 650)
  }
  const reset = () => { clearAuction(); setAuction(createAuction(rules)); setPlanStatus('Local strategy engine active'); setShowSettings(false) }
  const updateRule = (key: keyof AuctionConfig, value: number) => setRules((current) => ({ ...current, [key]: value }))
  const prepareClaudeStrategies = async (freshAuction = auction) => {
    setPlanning(true); setPlanStatus('Claude is preparing seven franchise strategies…')
    try {
      const plans = await requestClaudePlans(freshAuction)
      setAuction((current) => ({ ...current, aiPlans: plans, activity: ['Claude strategy room complete: seven teams have target lists and bid ceilings.', ...current.activity] }))
      setPlanStatus('Claude strategies ready — live bidding is local and dynamic')
    } catch (error) {
      setPlanStatus(error instanceof Error ? error.message : 'Claude strategy setup failed.')
    } finally { setPlanning(false) }
  }
  const startClaudeAuction = () => { const fresh = createAuction(rules); clearAuction(); setAuction(fresh); void prepareClaudeStrategies(fresh) }
  const rosterPreview = useMemo(() => auction.teams.filter((team) => team.roster.length).sort((a, b) => b.roster.length - a.roster.length), [auction.teams])

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">IPL</span><div><strong>AUCTION ROOM</strong><small>SEASON 2026 · SOLO SIMULATOR</small></div></div><div className="top-actions"><span className="save-status">● Saved locally</span><button onClick={() => setShowSettings(!showSettings)}>Rules & settings</button><button className="claude-button" disabled={planning} onClick={startClaudeAuction}>{planning ? 'Planning teams…' : 'Start Claude auction'}</button><button className="outline" onClick={reset}>New local auction</button></div></header>
    {showSettings && <section className="settings"><div><b>Configure auction rules</b><span>Changing rules starts a fresh auction. All active validations use these values.</span></div><label>Purse ₹L<input type="number" min="1000" value={rules.initialPurse} onChange={(event) => updateRule('initialPurse', Number(event.target.value))} /></label><label>Min squad<input type="number" min="1" value={rules.minimumSquad} onChange={(event) => updateRule('minimumSquad', Number(event.target.value))} /></label><label>Max squad<input type="number" min="1" value={rules.maximumSquad} onChange={(event) => updateRule('maximumSquad', Number(event.target.value))} /></label><label>Overseas cap<input type="number" min="0" value={rules.maximumOverseas} onChange={(event) => updateRule('maximumOverseas', Number(event.target.value))} /></label><button className="apply-rules" onClick={reset}>Apply & restart</button></section>}
    <main>
      <section className="stage">
        <div className="room-glow" />
        <aside className="scoreboard"><p className="kicker">PLAYER {progress}</p><div className="status-dot">LIVE</div><p>SET {Math.ceil((auction.currentIndex + 1) / 4)} · {auction.status === 'COMPLETE' ? 'COMPLETE' : 'ACCELERATED'}</p></aside>
        <div className="auctioneer"><div className="hammer"><span /></div><div className="auctioneer-head" /><div className="auctioneer-body"><span className="bowtie" /></div><p>AUCTIONEER</p></div>
        <div className="podium"><div className="podium-front" /></div>
        <div className="spotlight" />
        <div className="player-card">
          {player ? <><span className="role-chip">{roles[player.role]}</span><span className="rating">{player.rating}<small>OVR</small></span><div className="player-avatar">{player.name.split(' ').map((part) => part[0]).join('')}</div><h1>{player.name}</h1><p>{player.country} {player.overseas ? '· ✈ Overseas' : '· Domestic'}</p><strong>{player.specialty}</strong></> : <><span className="role-chip">FINAL BELL</span><h1>Auction<br />complete</h1><p>Review the table below or start a new auction.</p></>}
        </div>
        <div className="bid-board"><p className="kicker">CURRENT BID</p><strong>{bidLabel(auction.highBid)}</strong><span>{leader ? `${leader.name} leads` : player ? `Base price ₹${player.basePrice}L` : 'All lots complete'}</span><div className="pulse-line" /></div>
        <div className="seats">
          {auction.teams.map((team, index) => <div key={team.id} className={`seat ${team.isHuman ? 'human-seat' : ''} ${leader?.id === team.id ? 'leading' : ''}`} style={{ '--team': team.color, '--delay': `${index * 80}ms` } as React.CSSProperties}><div className="bidder"><i /><b>{team.shortName}</b></div><span>{team.purse}L</span><small>{team.roster.length} players</small></div>)}
        </div>
      </section>
      <section className="control-deck">
        <div className="your-team"><span style={{ background: human.color }} /><div><small>YOU ARE MANAGING</small><strong>{human.name}</strong><p>₹{human.purse}L remaining · {human.roster.length} signed</p></div></div>
        <div className="bid-controls"><p>{planning ? 'Seven AI franchises are setting their season strategy…' : aiThinking ? 'AI franchises are considering their response…' : player ? `Next accepted bid: ₹${nextBid}L` : 'The gavel has fallen.'}</p><div><button className="pass-button" disabled={!player || planning} onClick={() => { aiBid(); window.setTimeout(() => setAuction((current) => closeCurrentLot(current)), 400) }}>Pass / close lot</button><button className="bid-button" disabled={!player || aiThinking || planning || leader?.isHuman} onClick={handleHumanBid}>Bid ₹{nextBid}L <span>↗</span></button></div></div>
        <button className="queue-toggle" onClick={() => setShowQueue(!showQueue)}>{showQueue ? 'Hide' : 'Show'} full player queue <span>{showQueue ? '−' : '+'}</span></button>
      </section>
      {showQueue && <section className="queue"><div className="section-title"><div><p className="kicker">INTELLIGENCE LAYER</p><h2>Every franchise sees the same <em>future pool.</em></h2></div><p>{planStatus}. Claude plans the whole auction once; local logic adapts each bid to purses, rosters, and remaining alternatives.</p></div><div className="queue-list">{auction.queue.map((queuedPlayer, index) => <div className={`queue-item ${index === auction.currentIndex ? 'current' : index < auction.currentIndex ? 'done' : ''}`} key={queuedPlayer.id}><span>{String(index + 1).padStart(2, '0')}</span><b>{queuedPlayer.name}</b><small>{queuedPlayer.role} · {queuedPlayer.country}</small><strong>₹{queuedPlayer.basePrice}L</strong></div>)}</div></section>}
      <section className="bottom-grid"><article className="activity"><p className="kicker">TABLE TALK</p><h2>Live activity</h2>{auction.activity.slice(0, 5).map((line, index) => <p className={index === 0 ? 'latest' : ''} key={`${line}-${index}`}>{line}</p>)}</article><article className="strategy"><p className="kicker">AI SCOUTING</p><h2>Decision model</h2>{player ? auction.teams.filter((team) => !team.isHuman).slice(0, 3).map((team) => <div className="scout" key={team.id}><span style={{ background: team.color }} /><b>{team.shortName}</b><p>Maximum ₹{maxValuation(auction, team, player)}L</p><small>{auction.aiPlans[team.id]?.summary ?? 'Local role-and-value model'}</small></div>) : <p>The model has completed its final roster review.</p>}</article><article className="squads"><p className="kicker">SQUAD BOARD</p><h2>Signings</h2>{rosterPreview.length ? rosterPreview.map((team) => <p key={team.id}><b>{team.shortName}</b><span>{team.roster.map((member) => member.name).join(', ')}</span></p>) : <p>No players sold yet.</p>}</article></section>
    </main>
    <footer><span>IPL AUCTION SIMULATOR · LOCAL MVP</span><span>Claude integration belongs in a future secure server route, never in this browser app.</span></footer>
  </div>
}

export default App
