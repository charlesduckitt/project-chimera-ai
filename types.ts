export enum RaceType {
  HANDICAP = 'Handicap',
  NON_HANDICAP = 'Non-Handicap'
}

export enum RaceClass {
  CLASS_1 = 1,
  CLASS_2 = 2,
  CLASS_3 = 3,
  CLASS_4 = 4,
  CLASS_5 = 5,
  CLASS_6 = 6
}

export interface QualitativeAnalysis {
  isApproved: boolean;
  reasoning: string;
  riskFactors: string[];
  confidenceScore: number;
}

export interface Bet {
  id: string;
  date: string;
  horseName: string;
  raceCourse: string;
  bsp: number; // Betfair Starting Price
  stake: number;
  liability: number;
  result: 'WIN' | 'LOSS' | 'PENDING'; // Win means the Horse LOST (Lay win)
  profit: number;
  bankrollAfter: number;
}

export interface BankrollState {
  currentCapital: number;
  initialCapital: number;
  totalBets: number;
  wins: number;
  losses: number;
  maxDrawdown: number;
  isCircuitBreakerActive: boolean;
}
