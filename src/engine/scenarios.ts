import type { SimulationConfig } from './types';

export interface ScenarioPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  expectedOutcome: string;
  config: SimulationConfig;
}

const DEFAULT_SIM_PARAMS = {
  totalTicks: 50,
  seed: 42,
  auditProbability: 0.05,
  utilityWeight: 0.85,
  spinWeight: 1.15,
  synergyMultiplier: 1.25,
  sabotageCoefficient: 0.35,
};

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'bureaucratic-death-spiral',
    name: 'The Bureaucratic Death Spiral',
    subtitle: '8 teams, Survivor & Politician dominated',
    description:
      '80% Survivors, 10% Politicians, 10% Performers, zero Stars. Six Survivor team leaders and two Politician leaders. The Politicians are allied with each other. This represents a large, stagnant bureaucracy where innovation has been systematically extinguished.',
    expectedOutcome:
      'Bureaucratic dysfunction (foot-dragging, endless meetings, lost work) overwhelms everything. Innovation drops to zero. The winning narrative is pure self-preservation: "Resources are inadequate, but management is doing their best."',
    config: {
      ...DEFAULT_SIM_PARAMS,
      seed: 7741,
      teams: [
        { id: 't1', name: 'Operations', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't2', name: 'Compliance', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't3', name: 'HR', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't4', name: 'Finance', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't5', name: 'Admin', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't6', name: 'Facilities', leaderPersona: 'survivor', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't7', name: 'Strategy', leaderPersona: 'politician', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
        { id: 't8', name: 'Comms', leaderPersona: 'politician', composition: { star: 0, performer: 10, politician: 10, survivor: 80 }, memberCount: 20 },
      ],
      relationships: {
        't7-t8': 'allied',
      },
    },
  },
  {
    id: 'lone-star-trap',
    name: 'The Lone Star Trap',
    subtitle: '4 teams, one Star against politician alliance',
    description:
      'One Star-led team produces massive utility, but two allied Politician leaders target them with adversarial spin. A Survivor leader rounds out the field. Shows how a single Star cannot overcome a coordinated political coalition.',
    expectedOutcome:
      'The Star team generates the most real utility but the allied Politicians erode their narrative with sabotage coefficients. Politicians win by a slim margin, claiming credit while pushing the lone Star toward burnout.',
    config: {
      ...DEFAULT_SIM_PARAMS,
      seed: 3389,
      teams: [
        { id: 't1', name: 'Innovation Lab', leaderPersona: 'star', composition: { star: 10, performer: 20, politician: 20, survivor: 50 }, memberCount: 15 },
        { id: 't2', name: 'Marketing', leaderPersona: 'politician', composition: { star: 10, performer: 20, politician: 20, survivor: 50 }, memberCount: 15 },
        { id: 't3', name: 'Sales', leaderPersona: 'politician', composition: { star: 10, performer: 20, politician: 20, survivor: 50 }, memberCount: 15 },
        { id: 't4', name: 'Support', leaderPersona: 'survivor', composition: { star: 10, performer: 20, politician: 20, survivor: 50 }, memberCount: 15 },
      ],
      relationships: {
        't2-t3': 'allied',
        't1-t2': 'adversarial',
        't1-t3': 'adversarial',
      },
    },
  },
  {
    id: 'strategic-alignment',
    name: 'The Strategic Alignment',
    subtitle: '5 teams, Star coalition wins the narrative',
    description:
      'Three Star leaders are allied. One Performer leader and one Politician leader round out the structure. The synergy multiplier between allied Stars mathematically outpaces the lone Politician. This is the winning condition.',
    expectedOutcome:
      'The compounded TNS of the allied Star coalition forces Leadership to accept a beneficial narrative. The company thrives. This proves the core thesis: multiple allied Stars in leader positions are required to win.',
    config: {
      ...DEFAULT_SIM_PARAMS,
      seed: 5927,
      teams: [
        { id: 't1', name: 'Engineering', leaderPersona: 'star', composition: { star: 15, performer: 35, politician: 15, survivor: 35 }, memberCount: 10 },
        { id: 't2', name: 'Product', leaderPersona: 'star', composition: { star: 15, performer: 35, politician: 15, survivor: 35 }, memberCount: 10 },
        { id: 't3', name: 'Design', leaderPersona: 'star', composition: { star: 15, performer: 35, politician: 15, survivor: 35 }, memberCount: 10 },
        { id: 't4', name: 'QA', leaderPersona: 'performer', composition: { star: 10, performer: 40, politician: 10, survivor: 40 }, memberCount: 10 },
        { id: 't5', name: 'BD', leaderPersona: 'politician', composition: { star: 5, performer: 15, politician: 30, survivor: 50 }, memberCount: 10 },
      ],
      relationships: {
        't1-t2': 'allied',
        't1-t3': 'allied',
        't2-t3': 'allied',
        't5-t1': 'adversarial',
        't5-t2': 'adversarial',
        't5-t3': 'adversarial',
      },
    },
  },
];
