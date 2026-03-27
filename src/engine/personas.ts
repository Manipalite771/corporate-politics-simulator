import type { Persona, PersonaTraits } from './types';

export const PERSONA_LABELS: Record<Persona, string> = {
  star: 'Star',
  performer: 'Performer',
  politician: 'Politician',
  survivor: 'Survivor',
};

export const PERSONA_COLORS: Record<Persona, string> = {
  star: '#f59e0b',
  performer: '#3b82f6',
  politician: '#ef4444',
  survivor: '#6b7280',
};

export const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  star: 'High Performance, High Politics — delivers results and ensures visibility',
  performer: 'High Performance, Low Politics — does great work but hates corporate games',
  politician: 'Low Performance, High Politics — masters of spin, credit-claiming, and optics',
  survivor: 'Low Performance, Low Politics — does the bare minimum to collect a paycheck',
};

/**
 * Base narrative generation rates per persona per tick.
 * [utility, spin]
 */
export const BASE_GENERATION: Record<Persona, [number, number]> = {
  star: [8, 6],
  performer: [9, 0],
  politician: [1, 9],
  survivor: [1, 1],
};

/**
 * Homophily Weight Matrix from Approach 2.
 * homophilyWeights[leaderPersona][memberPersona] = weight applied to member's narrative
 */
export const HOMOPHILY_WEIGHTS: Record<Persona, Record<Persona, number>> = {
  star: { star: 1.0, performer: 1.0, politician: 0.5, survivor: 0.2 },
  performer: { star: 0.9, performer: 1.0, politician: 0.1, survivor: 0.1 },
  politician: { star: 0.5, performer: 0.8, politician: 1.0, survivor: 0.8 },
  survivor: { star: 0.2, performer: 0.4, politician: 0.9, survivor: 1.0 },
};

export const PERSONA_TRAITS: Record<Persona, PersonaTraits> = {
  star: {
    positive: [
      {
        def: { name: 'Strategic Vision', type: 'positive', description: 'Compound +0.2 multiplier to team utility over time' },
        effect: { utilityMod: 0.2, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Cross-functional Synergy', type: 'positive', description: '+1.5x multiplier to adjacent Performer utility' },
        effect: { utilityMod: 1.5, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'High-Yield Output', type: 'positive', description: 'Highest base performance data each tick' },
        effect: { utilityMod: 3.0, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Morale Boosting', type: 'positive', description: 'Reduces negative trait activation in allies by 20%' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: 0, moraleMod: 0.2, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Process Optimization', type: 'positive', description: 'Reduces organizational friction' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: -0.15, moraleMod: 0, triggerProbability: 1.0 },
      },
    ],
    negative: [
      {
        def: { name: 'High Resource Demands', type: 'negative', description: 'Consumes slightly more team budget' },
        effect: { utilityMod: -0.05, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Perfectionism Bottleneck', type: 'negative', description: '5% chance to delay delivery by one tick' },
        effect: { utilityMod: -2.0, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 0.05 },
      },
      {
        def: { name: 'Intimidation Factor', type: 'negative', description: 'Increases hostility in adjacent Politicians by +0.1' },
        effect: { utilityMod: 0, spinMod: 0.1, frictionMod: 0.05, moraleMod: 0, triggerProbability: 0.5 },
      },
      {
        def: { name: 'Burnout Risk', type: 'negative', description: '2% chance to halve performance if isolated from other Stars' },
        effect: { utilityMod: -4.0, spinMod: 0, frictionMod: 0, moraleMod: -0.1, triggerProbability: 0.02 },
      },
      {
        def: { name: 'Over-delegation', type: 'negative', description: '3% chance to assign complex tasks to Survivors, losing utility' },
        effect: { utilityMod: -1.0, spinMod: 0, frictionMod: 0.05, moraleMod: 0, triggerProbability: 0.03 },
      },
    ],
  },

  performer: {
    positive: [
      {
        def: { name: 'Reliable Delivery', type: 'positive', description: 'Consistent utility every turn, zero variance' },
        effect: { utilityMod: 2.0, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Deep Technical Skill', type: 'positive', description: 'Resolves blocker tokens that halt team progress' },
        effect: { utilityMod: 1.5, spinMod: 0, frictionMod: -0.1, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Autonomous Execution', type: 'positive', description: 'Requires zero management input' },
        effect: { utilityMod: 0.5, spinMod: 0, frictionMod: -0.05, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Direct Communication', type: 'positive', description: 'High clarity, generates exactly 0 spin' },
        effect: { utilityMod: 0.5, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'High Efficiency', type: 'positive', description: '20% lower resource cost' },
        effect: { utilityMod: 1.0, spinMod: 0, frictionMod: -0.05, moraleMod: 0, triggerProbability: 1.0 },
      },
    ],
    negative: [
      {
        def: { name: 'Optic Ignorance', type: 'negative', description: 'Work invisible to LG unless amplified by Star TL' },
        effect: { utilityMod: 0, spinMod: -0.5, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Abrasiveness', type: 'negative', description: 'Decreases team cohesion by -0.15 with Politicians' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: 0.15, moraleMod: -0.1, triggerProbability: 0.7 },
      },
      {
        def: { name: 'Siloed Operation', type: 'negative', description: 'Does not share narrative points, prevents synergy' },
        effect: { utilityMod: -0.5, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Vulnerability to Theft', type: 'negative', description: '50% chance Politician TL siphons their utility' },
        effect: { utilityMod: -3.0, spinMod: 0, frictionMod: 0, moraleMod: -0.15, triggerProbability: 0.5 },
      },
      {
        def: { name: 'Flight Risk', type: 'negative', description: '15% chance per turn to leave if credit stolen repeatedly' },
        effect: { utilityMod: -9.0, spinMod: 0, frictionMod: 0, moraleMod: -0.3, triggerProbability: 0.15 },
      },
    ],
  },

  politician: {
    positive: [
      {
        def: { name: 'Stakeholder Management', type: 'positive', description: 'Generates massive spin accepted as positive by LG' },
        effect: { utilityMod: 0, spinMod: 4.0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Conflict Mediation', type: 'positive', description: 'Prevents adversarial states from halting output' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: -0.1, moraleMod: 0.05, triggerProbability: 0.6 },
      },
      {
        def: { name: 'High Visibility', type: 'positive', description: '1.8x multiplier on upward narrative transmission' },
        effect: { utilityMod: 0, spinMod: 1.8, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Network Scaling', type: 'positive', description: 'Builds positive relationship modifiers with other Politicians' },
        effect: { utilityMod: 0, spinMod: 1.0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Fluid Repackaging', type: 'positive', description: '40% chance to convert failure into positive spin' },
        effect: { utilityMod: 0, spinMod: 3.0, frictionMod: 0, moraleMod: 0, triggerProbability: 0.4 },
      },
    ],
    negative: [
      {
        def: { name: 'Credit Claiming', type: 'negative', description: 'Steals utility from Performers, adds to own tracker' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: 0, moraleMod: -0.2, triggerProbability: 0.8 },
      },
      {
        def: { name: 'Endless Meetings', type: 'negative', description: 'Meeting friction: +2 ticks to team cycle' },
        effect: { utilityMod: -1.5, spinMod: 0, frictionMod: 0.2, moraleMod: -0.05, triggerProbability: 0.7 },
      },
      {
        def: { name: 'Derailing Tangents', type: 'negative', description: 'Derails focus, adds noise diluting beneficial narratives' },
        effect: { utilityMod: -1.0, spinMod: 0, frictionMod: 0.15, moraleMod: -0.05, triggerProbability: 0.6 },
      },
      {
        def: { name: 'Nitpick Paralysis', type: 'negative', description: 'Delays narrative transmission by extra turn' },
        effect: { utilityMod: -0.5, spinMod: 0, frictionMod: 0.1, moraleMod: 0, triggerProbability: 0.5 },
      },
      {
        def: { name: 'Work Deferral', type: 'negative', description: 'Pushes tasks to Performers, increasing their burnout' },
        effect: { utilityMod: -1.0, spinMod: 0, frictionMod: 0.1, moraleMod: -0.1, triggerProbability: 0.6 },
      },
    ],
  },

  survivor: {
    positive: [
      {
        def: { name: 'Predictable Routine', type: 'positive', description: 'Stable but extremely low baseline presence' },
        effect: { utilityMod: 0.5, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Status Quo Adherence', type: 'positive', description: 'Prevents extreme negative outliers as ballast' },
        effect: { utilityMod: 0.2, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Threat Avoidance', type: 'positive', description: '100% compliance rate for minor tasks' },
        effect: { utilityMod: 0.3, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Low Resource Cost', type: 'positive', description: 'Minimum operational budget to maintain' },
        effect: { utilityMod: 0.1, spinMod: 0, frictionMod: 0, moraleMod: 0, triggerProbability: 1.0 },
      },
      {
        def: { name: 'Apathetic Resilience', type: 'positive', description: 'Immune to morale penalties from external shocks' },
        effect: { utilityMod: 0, spinMod: 0, frictionMod: 0, moraleMod: 0.1, triggerProbability: 1.0 },
      },
    ],
    negative: [
      {
        def: { name: 'Deliberate Foot-Dragging', type: 'negative', description: 'Multiplies task time by 2.0-2.5x' },
        effect: { utilityMod: -2.5, spinMod: 0, frictionMod: 0.25, moraleMod: -0.05, triggerProbability: 0.8 },
      },
      {
        def: { name: 'Constant Interruptions', type: 'negative', description: 'Subtracts utility points every 3 ticks' },
        effect: { utilityMod: -1.5, spinMod: 0, frictionMod: 0.15, moraleMod: -0.05, triggerProbability: 0.7 },
      },
      {
        def: { name: 'Lost Work & Files', type: 'negative', description: '15% chance to permanently delete portion of team utility pool' },
        effect: { utilityMod: -3.0, spinMod: 0, frictionMod: 0.1, moraleMod: -0.1, triggerProbability: 0.15 },
      },
      {
        def: { name: 'Blame-Shifting', type: 'negative', description: 'Generates spin shifting fault to company systems' },
        effect: { utilityMod: -0.5, spinMod: 1.5, frictionMod: 0.1, moraleMod: -0.05, triggerProbability: 0.7 },
      },
      {
        def: { name: 'Rumor Spreading', type: 'negative', description: 'Spreads negative spin, lowering entire team morale' },
        effect: { utilityMod: 0, spinMod: 0.5, frictionMod: 0.15, moraleMod: -0.15, triggerProbability: 0.6 },
      },
    ],
  },
};
