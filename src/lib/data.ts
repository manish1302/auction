import type { AuctionConfig, Player, Team } from './types'
export const defaultConfig: AuctionConfig = { initialPurse: 10000, minimumSquad: 15, maximumSquad: 25, maximumOverseas: 8, minimumBid: 200 }
export const players: Player[] = [
  { id: 'p1', name: 'Arjun Mehta', role: 'BAT', country: 'India', overseas: false, basePrice: 200, rating: 88, specialty: 'Explosive opener' },
  { id: 'p2', name: 'Liam Hart', role: 'AR', country: 'England', overseas: true, basePrice: 250, rating: 91, specialty: 'Power-hitting all-rounder' },
  { id: 'p3', name: 'Karthik Iyer', role: 'WK', country: 'India', overseas: false, basePrice: 150, rating: 82, specialty: 'Finisher & keeper' },
  { id: 'p4', name: 'Ravi Desai', role: 'BOWL', country: 'India', overseas: false, basePrice: 200, rating: 89, specialty: 'Death-overs specialist' },
  { id: 'p5', name: 'Noah King', role: 'BAT', country: 'Australia', overseas: true, basePrice: 200, rating: 86, specialty: 'Dynamic middle order' },
  { id: 'p6', name: 'Sahil Rana', role: 'AR', country: 'India', overseas: false, basePrice: 150, rating: 78, specialty: 'Left-arm spin option' },
  { id: 'p7', name: 'Kabir Shah', role: 'BOWL', country: 'India', overseas: false, basePrice: 100, rating: 75, specialty: 'New-ball swing' },
  { id: 'p8', name: 'Mateo Cruz', role: 'WK', country: 'South Africa', overseas: true, basePrice: 150, rating: 84, specialty: 'Athletic wicketkeeper' },
  { id: 'p9', name: 'Vikram Sethi', role: 'BAT', country: 'India', overseas: false, basePrice: 100, rating: 73, specialty: 'Dependable anchor' },
  { id: 'p10', name: 'Ethan Cole', role: 'BOWL', country: 'New Zealand', overseas: true, basePrice: 100, rating: 80, specialty: 'Hit-the-deck quick' },
]
const franchiseData = [['coastal', 'Coastal Kings', 'CK', 'A. Narayan', '#25b1ce'], ['capital', 'Capital Comets', 'CC', 'R. Malhotra', '#ec586d'], ['deccan', 'Deccan Falcons', 'DF', 'M. Reddy', '#e6a93b'], ['frontier', 'Frontier Riders', 'FR', 'P. Kaur', '#6c8de6'], ['harbour', 'Harbour Hawks', 'HH', 'S. Mehra', '#54b773'], ['royals', 'Rajasthan Royals', 'RR', 'K. Singh', '#a67eea'], ['tigers', 'Bengal Tigers', 'BT', 'D. Bose', '#f17f48'], ['warriors', 'Western Warriors', 'WW', 'N. Shah', '#bc8e58']] as const
export const createTeams = (purse = defaultConfig.initialPurse): Team[] => franchiseData.map(([id, name, shortName, owner, color], index) => ({ id, name, shortName, owner, color, purse, roster: [], isHuman: index === 0 }))
