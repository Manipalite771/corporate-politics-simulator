import type {
  SimulationConfig,
  SimulationResult,
  TeamState,
  TeamConfig,
  Member,
  TickLog,
  Persona,
  RelationshipState,
} from './types';
import { BASE_GENERATION, HOMOPHILY_WEIGHTS, PERSONA_TRAITS } from './personas';

class SeededRandom {
  private state: number;
  constructor(seed: number) {
    this.state = seed;
  }
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xffffffff;
    return (this.state >>> 0) / 0xffffffff;
  }
}

function createMembers(config: TeamConfig, rng: SeededRandom): Member[] {
  const members: Member[] = [];
  const personas: Persona[] = ['star', 'performer', 'politician', 'survivor'];
  let id = 0;

  members.push({
    id: `${config.id}-leader`,
    persona: config.leaderPersona,
    isLeader: true,
    morale: 1.0,
    creditStolenCount: 0,
    active: true,
  });

  const nonLeaderCount = config.memberCount - 1;
  for (const persona of personas) {
    const pct = config.composition[persona];
    let count = Math.round((pct / 100) * nonLeaderCount);
    if (persona === config.leaderPersona) {
      count = Math.max(0, count - 1);
    }
    for (let i = 0; i < count; i++) {
      members.push({
        id: `${config.id}-m${id++}`,
        persona,
        isLeader: false,
        morale: 0.8 + rng.next() * 0.2,
        creditStolenCount: 0,
        active: true,
      });
    }
  }

  while (members.length < config.memberCount) {
    const fillerPersona = personas[Math.floor(rng.next() * personas.length)];
    members.push({
      id: `${config.id}-m${id++}`,
      persona: fillerPersona,
      isLeader: false,
      morale: 0.8 + rng.next() * 0.2,
      creditStolenCount: 0,
      active: true,
    });
  }

  while (members.length > config.memberCount) {
    members.pop();
  }

  return members;
}

function getRelationship(
  config: SimulationConfig,
  teamA: string,
  teamB: string
): RelationshipState {
  const key1 = `${teamA}-${teamB}`;
  const key2 = `${teamB}-${teamA}`;
  return config.relationships[key1] ?? config.relationships[key2] ?? 'neutral';
}

function computeTraitEffects(
  member: Member,
  rng: SeededRandom,
  starCount: number,
  hasPoliticianLeader: boolean,
  starMoraleReduction: number
): { utilityDelta: number; spinDelta: number; frictionDelta: number; moraleDelta: number; events: string[] } {
  const traits = PERSONA_TRAITS[member.persona];
  let utilityDelta = 0;
  let spinDelta = 0;
  let frictionDelta = 0;
  let moraleDelta = 0;
  const events: string[] = [];

  for (const t of traits.positive) {
    let prob = t.effect.triggerProbability;
    if (starMoraleReduction > 0 && t.effect.triggerProbability < 1.0) {
      prob = Math.min(1.0, prob + starMoraleReduction * 0.2);
    }
    if (rng.next() < prob) {
      utilityDelta += t.effect.utilityMod;
      spinDelta += t.effect.spinMod;
      frictionDelta += t.effect.frictionMod;
      moraleDelta += t.effect.moraleMod;
    }
  }

  for (const t of traits.negative) {
    let prob = t.effect.triggerProbability;
    if (starMoraleReduction > 0) {
      prob = Math.max(0, prob - starMoraleReduction);
    }

    if (member.persona === 'star' && t.def.name === 'Burnout Risk' && starCount <= 1) {
      prob = Math.min(0.15, prob * 3);
    }

    if (
      member.persona === 'performer' &&
      t.def.name === 'Vulnerability to Theft' &&
      hasPoliticianLeader
    ) {
      prob = 0.5;
    }

    if (
      member.persona === 'performer' &&
      t.def.name === 'Flight Risk' &&
      member.creditStolenCount >= 3
    ) {
      prob = Math.min(0.5, 0.15 * member.creditStolenCount);
    } else if (member.persona === 'performer' && t.def.name === 'Flight Risk') {
      prob = 0;
    }

    if (rng.next() < prob) {
      utilityDelta += t.effect.utilityMod;
      spinDelta += t.effect.spinMod;
      frictionDelta += t.effect.frictionMod;
      moraleDelta += t.effect.moraleMod;
      events.push(`${t.def.name} triggered on ${member.persona}`);
    }
  }

  return { utilityDelta, spinDelta, frictionDelta, moraleDelta, events };
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const rng = new SeededRandom(config.seed);
  const tickLogs: TickLog[] = [];

  const teamStates: TeamState[] = config.teams.map((tc) => ({
    config: tc,
    members: createMembers(tc, rng),
    leader: null!,
    rawNarrative: { utility: 0, spin: 0 },
    filteredNarrative: { utility: 0, spin: 0 },
    effectiveNarrative: { utility: 0, spin: 0 },
    totalNarrativeScore: 0,
    cumulativeTNS: 0,
    cumulativeUtility: 0,
    companyHealthContribution: 0,
    bureaucracyLoad: 0,
    politicsClimate: 0,
  }));

  for (const ts of teamStates) {
    ts.leader = ts.members.find((m) => m.isLeader)!;
  }

  for (let tick = 1; tick <= config.totalTicks; tick++) {
    const tickTeamLogs: TickLog['teams'] = [];
    let auditTriggered = false;
    const auditPenalties: string[] = [];

    const allTeamEvents: Map<string, string[]> = new Map();

    for (const ts of teamStates) {
      const memberEvents: string[] = [];
      allTeamEvents.set(ts.config.id, memberEvents);
      let rawU = 0;
      let rawS = 0;
      let teamFriction = ts.bureaucracyLoad;

      const starCount = ts.members.filter(
        (m) => m.persona === 'star' && m.active
      ).length;
      const hasPoliticianLeader = ts.leader.persona === 'politician';
      const starMoraleBoost = starCount * 0.05;

      const memberOutputs: Map<string, { u: number; s: number }> = new Map();

      for (const member of ts.members) {
        if (!member.active) { memberOutputs.set(member.id, { u: 0, s: 0 }); continue; }

        const [baseU, baseS] = BASE_GENERATION[member.persona];
        const moraleMultiplier = Math.max(0.2, member.morale);
        const frictionPenalty = Math.max(0, 1 - teamFriction * 0.3);

        const effects = computeTraitEffects(
          member,
          rng,
          starCount,
          hasPoliticianLeader,
          starMoraleBoost
        );

        let memberU = (baseU + effects.utilityDelta) * moraleMultiplier * frictionPenalty;
        let memberS = (baseS + effects.spinDelta) * moraleMultiplier;

        if (
          member.persona === 'performer' &&
          hasPoliticianLeader &&
          effects.events.some((e) => e.includes('Vulnerability to Theft'))
        ) {
          member.creditStolenCount++;
          memberEvents.push(
            `Politician TL claimed credit for ${member.id}'s work`
          );
        }

        if (effects.events.some((e) => e.includes('Flight Risk'))) {
          member.active = false;
          memberU = 0;
          memberS = 0;
          memberEvents.push(`${member.id} (Performer) left the organization!`);
        }

        memberU = Math.max(0, memberU);
        memberS = Math.max(0, memberS);

        memberOutputs.set(member.id, { u: memberU, s: memberS });
        rawU += memberU;
        rawS += memberS;

        member.morale = Math.max(0.1, Math.min(1.0, member.morale + effects.moraleDelta * 0.1));
        teamFriction += effects.frictionDelta * 0.02;

        for (const evt of effects.events) {
          memberEvents.push(evt);
        }
      }

      ts.rawNarrative = { utility: rawU, spin: rawS };

      let filteredU = 0;
      let filteredS = 0;
      const leaderWeights = HOMOPHILY_WEIGHTS[ts.leader.persona];

      for (const member of ts.members) {
        if (!member.active) continue;
        const weight = leaderWeights[member.persona];
        const output = memberOutputs.get(member.id) ?? { u: 0, s: 0 };
        filteredU += output.u * weight;
        filteredS += output.s * weight;
      }

      if (ts.leader.persona === 'politician') {
        filteredS *= 1.8;
      }
      if (ts.leader.persona === 'star') {
        filteredU *= 1.2;
        filteredS *= 1.1;
      }

      ts.filteredNarrative = {
        utility: Math.max(0, filteredU),
        spin: Math.max(0, filteredS),
      };

      ts.bureaucracyLoad = Math.min(1.0, Math.max(0, teamFriction));

      const politicianCount = ts.members.filter(
        (m) => m.persona === 'politician' && m.active
      ).length;
      const survivorCount = ts.members.filter(
        (m) => m.persona === 'survivor' && m.active
      ).length;
      ts.politicsClimate = Math.min(
        1.0,
        (politicianCount * 0.08 + survivorCount * 0.04) *
          (1 + ts.bureaucracyLoad)
      );
    }

    for (const ts of teamStates) {
      let effectiveU = ts.filteredNarrative.utility;
      let effectiveS = ts.filteredNarrative.spin;

      for (const other of teamStates) {
        if (other.config.id === ts.config.id) continue;
        const rel = getRelationship(config, ts.config.id, other.config.id);

        if (rel === 'allied') {
          const synergyU = other.filteredNarrative.utility * 0.1 * config.synergyMultiplier;
          const synergyS = other.filteredNarrative.spin * 0.15 * config.synergyMultiplier;
          effectiveU += synergyU;
          effectiveS += synergyS;
        } else if (rel === 'adversarial') {
          const erosion = other.filteredNarrative.spin * config.sabotageCoefficient;
          effectiveU -= erosion * 0.5;
          effectiveS -= erosion * 0.3;
        }
      }

      ts.effectiveNarrative = {
        utility: Math.max(0, effectiveU),
        spin: Math.max(0, effectiveS),
      };

      ts.totalNarrativeScore =
        config.utilityWeight * ts.effectiveNarrative.utility +
        config.spinWeight * ts.effectiveNarrative.spin;

      ts.cumulativeTNS += ts.totalNarrativeScore;

      const trueUtility = ts.rawNarrative.utility * (1 - ts.politicsClimate * 0.3);
      ts.companyHealthContribution += trueUtility;
      ts.cumulativeUtility += ts.rawNarrative.utility;
    }

    if (rng.next() < config.auditProbability) {
      auditTriggered = true;
      for (const ts of teamStates) {
        const spinRatio =
          ts.effectiveNarrative.spin /
          (ts.effectiveNarrative.utility + ts.effectiveNarrative.spin + 0.01);
        if (spinRatio > 0.65) {
          const penalty = ts.cumulativeTNS * 0.15;
          ts.cumulativeTNS -= penalty;
          auditPenalties.push(
            `${ts.config.name}: Audit detected high spin ratio (${(spinRatio * 100).toFixed(0)}%). TNS penalty: -${penalty.toFixed(1)}`
          );
        }
      }
    }

    for (const ts of teamStates) {
      tickTeamLogs.push({
        teamId: ts.config.id,
        teamName: ts.config.name,
        leaderPersona: ts.config.leaderPersona,
        rawNarrative: { ...ts.rawNarrative },
        filteredNarrative: { ...ts.filteredNarrative },
        effectiveNarrative: { ...ts.effectiveNarrative },
        tns: ts.totalNarrativeScore,
        cumulativeTNS: ts.cumulativeTNS,
        companyHealth: ts.companyHealthContribution,
        cumulativeUtility: ts.cumulativeUtility,
        memberEvents: allTeamEvents.get(ts.config.id) ?? [],
        bureaucracyLoad: ts.bureaucracyLoad,
        politicsClimate: ts.politicsClimate,
        activeMembers: ts.members.filter((m) => m.active).length,
        totalMembers: ts.members.length,
      });
    }

    tickLogs.push({
      tick,
      teams: tickTeamLogs,
      auditTriggered,
      auditPenalties,
    });
  }

  const finalScores = teamStates.map((ts) => ({
    teamId: ts.config.id,
    teamName: ts.config.name,
    tns: ts.cumulativeTNS,
    companyHealth: ts.companyHealthContribution,
  }));

  const narrativeWarWinner = finalScores.reduce((a, b) =>
    a.tns > b.tns ? a : b
  ).teamId;
  const companyHealthWinner = finalScores.reduce((a, b) =>
    a.companyHealth > b.companyHealth ? a : b
  ).teamId;

  return {
    tickLogs,
    narrativeWarWinner,
    companyHealthWinner,
    finalScores,
    totalTicks: config.totalTicks,
    divergence: narrativeWarWinner !== companyHealthWinner,
  };
}
