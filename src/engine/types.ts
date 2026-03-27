export type Persona = 'star' | 'performer' | 'politician' | 'survivor';

export type RelationshipState = 'allied' | 'neutral' | 'adversarial';

export interface TraitDefinition {
  name: string;
  type: 'positive' | 'negative';
  description: string;
}

export interface TraitEffect {
  utilityMod: number;
  spinMod: number;
  frictionMod: number;
  moraleMod: number;
  triggerProbability: number;
}

export interface PersonaTraits {
  positive: { def: TraitDefinition; effect: TraitEffect }[];
  negative: { def: TraitDefinition; effect: TraitEffect }[];
}

export interface Member {
  id: string;
  persona: Persona;
  isLeader: boolean;
  morale: number;
  creditStolenCount: number;
  active: boolean;
}

export interface NarrativeVector {
  utility: number;
  spin: number;
}

export interface TeamConfig {
  id: string;
  name: string;
  leaderPersona: Persona;
  composition: Record<Persona, number>; // percentages summing to 100
  memberCount: number;
}

export interface SimulationConfig {
  teams: TeamConfig[];
  relationships: Record<string, RelationshipState>; // "teamA-teamB" -> state
  totalTicks: number;
  seed: number;
  auditProbability: number;
  utilityWeight: number;  // ω₁ default 0.85
  spinWeight: number;     // ω₂ default 1.15
  synergyMultiplier: number; // δ default 1.25
  sabotageCoefficient: number; // λ default 0.35
}

export interface TeamState {
  config: TeamConfig;
  members: Member[];
  leader: Member;
  rawNarrative: NarrativeVector;
  filteredNarrative: NarrativeVector;
  effectiveNarrative: NarrativeVector;
  totalNarrativeScore: number;
  cumulativeTNS: number;
  cumulativeUtility: number;
  companyHealthContribution: number;
  bureaucracyLoad: number;
  politicsClimate: number;
}

export interface TickLog {
  tick: number;
  teams: {
    teamId: string;
    teamName: string;
    leaderPersona: Persona;
    rawNarrative: NarrativeVector;
    filteredNarrative: NarrativeVector;
    effectiveNarrative: NarrativeVector;
    tns: number;
    cumulativeTNS: number;
    companyHealth: number;
    cumulativeUtility: number;
    memberEvents: string[];
    bureaucracyLoad: number;
    politicsClimate: number;
    activeMembers: number;
    totalMembers: number;
  }[];
  auditTriggered: boolean;
  auditPenalties: string[];
}

export interface SimulationResult {
  tickLogs: TickLog[];
  narrativeWarWinner: string;
  companyHealthWinner: string;
  finalScores: { teamId: string; teamName: string; tns: number; companyHealth: number }[];
  totalTicks: number;
  divergence: boolean; // narrative winner != company health winner
}
