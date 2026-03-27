import { useState } from 'react';
import type { SimulationConfig, TeamConfig, Persona, RelationshipState } from '../engine/types';
import { PERSONA_LABELS, PERSONA_COLORS, PERSONA_DESCRIPTIONS } from '../engine/personas';
import { Users, Plus, Trash2, Play, ArrowLeft, Info } from 'lucide-react';

interface Props {
  onRun: (config: SimulationConfig) => void;
  onBack: () => void;
  initialConfig?: SimulationConfig;
}

const PERSONAS: Persona[] = ['star', 'performer', 'politician', 'survivor'];

const PERSONA_SUMMARIES: Record<Persona, string> = {
  star: 'High output + high visibility. Amplifies Performers. Minimal negative traits.',
  performer: 'Highest raw output, zero spin. Work is invisible without a Star leader.',
  politician: 'Low output, massive spin. Steals credit, causes meetings, delays decisions.',
  survivor: 'Minimal output, maximum friction. Slowdowns, rumors, lost work, blame-shifting.',
};

const LEADER_FILTER_NOTES: Record<Persona, string> = {
  star: 'Passes all utility through (1.0x Stars, 1.0x Performers). Halves Politician spin.',
  performer: 'Respects competence but ignores politics — filters out Politicians and Survivors hard (0.1x).',
  politician: 'Steals Performer credit (0.8x). Echo-chambers other Politicians (1.0x). Views Stars as threats (0.5x).',
  survivor: 'Suppresses Stars (0.2x) and Performers (0.4x). Amplifies Politicians (0.9x) and fellow Survivors (1.0x).',
};

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 cursor-help">
      <Info size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-800" />
      </span>
    </span>
  );
}

function defaultTeam(index: number): TeamConfig {
  return {
    id: `t${index}`,
    name: `Team ${index + 1}`,
    leaderPersona: 'survivor',
    composition: { star: 5, performer: 25, politician: 20, survivor: 50 },
    memberCount: 10,
  };
}

function normalizeComposition(comp: Record<Persona, number>, changedKey: Persona, newVal: number): Record<Persona, number> {
  const result = { ...comp };
  result[changedKey] = newVal;
  const others = PERSONAS.filter((p) => p !== changedKey);
  const remaining = 100 - newVal;
  const othersSum = others.reduce((s, p) => s + result[p], 0);
  if (othersSum === 0) {
    others.forEach((p) => (result[p] = Math.round(remaining / others.length)));
  } else {
    others.forEach((p) => (result[p] = Math.round((result[p] / othersSum) * remaining)));
  }
  const total = PERSONAS.reduce((s, p) => s + result[p], 0);
  if (total !== 100) {
    result[others[0]] += 100 - total;
  }
  return result;
}

let nextTeamId = 100;

export default function ConfigPanel({ onRun, onBack, initialConfig }: Props) {
  const [teams, setTeams] = useState<TeamConfig[]>(
    initialConfig?.teams ?? [defaultTeam(0), defaultTeam(1)]
  );
  const [relationships, setRelationships] = useState<Record<string, RelationshipState>>(
    initialConfig?.relationships ?? {}
  );
  const [totalTicks, setTotalTicks] = useState(initialConfig?.totalTicks ?? 50);
  const [auditProb, setAuditProb] = useState(initialConfig?.auditProbability ?? 0.05);
  const [seed, setSeed] = useState(initialConfig?.seed ?? Math.floor(Math.random() * 99999));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [utilityWeight, setUtilityWeight] = useState(initialConfig?.utilityWeight ?? 0.85);
  const [spinWeight, setSpinWeight] = useState(initialConfig?.spinWeight ?? 1.15);

  const addTeam = () => {
    if (teams.length >= 10) return;
    const team = defaultTeam(nextTeamId++);
    setTeams([...teams, team]);
  };

  const removeTeam = (idx: number) => {
    if (teams.length <= 2) return;
    const removed = teams[idx];
    const newTeams = teams.filter((_, i) => i !== idx);
    const newRels = { ...relationships };
    for (const key of Object.keys(newRels)) {
      const parts = key.split('-');
      if (parts[0] === removed.id || parts[1] === removed.id) delete newRels[key];
    }
    setTeams(newTeams);
    setRelationships(newRels);
  };

  const updateTeam = (idx: number, patch: Partial<TeamConfig>) => {
    setTeams(teams.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const getRelKey = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  const getRel = (a: string, b: string): RelationshipState =>
    relationships[getRelKey(a, b)] ?? 'neutral';

  const setRel = (a: string, b: string, val: RelationshipState) => {
    setRelationships({ ...relationships, [getRelKey(a, b)]: val });
  };

  const handleRun = () => {
    onRun({
      teams,
      relationships,
      totalTicks,
      seed,
      auditProbability: auditProb,
      utilityWeight,
      spinWeight,
      synergyMultiplier: 1.25,
      sabotageCoefficient: 0.35,
    });
  };

  const relColors: Record<RelationshipState, string> = {
    allied: 'bg-green-500/20 text-green-400 border-green-500/40',
    neutral: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40',
    adversarial: 'bg-red-500/20 text-red-400 border-red-500/40',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Custom Simulation Setup</h2>
      </div>

      {/* Persona Reference — compact strip before configuration */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Persona Quick Reference</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PERSONAS.map((p) => (
            <div key={p} className="group relative flex items-start gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <span className="inline-block w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: PERSONA_COLORS[p] }} />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-zinc-200">{PERSONA_LABELS[p]}</span>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">{PERSONA_SUMMARIES[p]}</p>
                <p className="text-[10px] text-zinc-600 leading-snug mt-1 italic">As leader: {LEADER_FILTER_NOTES[p]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Simulation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center text-sm text-zinc-400 mb-1">
              Rounds (Ticks)
              <Tooltip text="How many time steps the simulation runs. Each tick, every team member generates narrative output, leaders filter it, and coalitions apply. More ticks = more time for compounding effects and drift." />
            </label>
            <input
              type="range" min={10} max={100} value={totalTicks}
              onChange={(e) => setTotalTicks(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-sm text-zinc-300">{totalTicks}</span>
          </div>
          <div>
            <label className="flex items-center text-sm text-zinc-400 mb-1">
              Audit Probability
              <Tooltip text="Chance per tick that leadership conducts an audit. Audits penalize teams whose narrative is mostly spin (>65% spin ratio) by cutting 15% of their cumulative score. Higher audit probability makes it harder for pure-spin teams to win." />
            </label>
            <input
              type="range" min={0} max={50} value={Math.round(auditProb * 100)}
              onChange={(e) => setAuditProb(Number(e.target.value) / 100)}
              className="w-full accent-amber-500"
            />
            <span className="text-sm text-zinc-300">{(auditProb * 100).toFixed(0)}%</span>
          </div>
          <div>
            <label className="flex items-center text-sm text-zinc-400 mb-1">
              Random Seed
              <Tooltip text="Controls the randomness of trait activations (e.g. credit theft, sabotage triggers). Same seed + same config = identical results every time. Change the seed to see how randomness affects outcomes." />
            </label>
            <input
              type="number" value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-200 text-sm"
            />
          </div>
        </div>

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          {showAdvanced ? 'Hide' : 'Show'} Advanced Weights
        </button>
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div>
              <label className="flex items-center text-sm text-zinc-400 mb-1">
                Utility Weight (ω₁): {utilityWeight.toFixed(2)}
                <Tooltip text="How much leadership values real output (Utility) when scoring narratives. Default is 0.85. Higher = leadership cares more about actual results. In a meritocratic org, set this above 1.0." />
              </label>
              <input type="range" min={10} max={150} value={Math.round(utilityWeight * 100)}
                onChange={(e) => setUtilityWeight(Number(e.target.value) / 100)}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center text-sm text-zinc-400 mb-1">
                Spin Weight (ω₂): {spinWeight.toFixed(2)}
                <Tooltip text="How much leadership values optics and political packaging (Spin) when scoring narratives. Default is 1.15 — slightly above Utility Weight, reflecting the reality that polished presentations often beat raw data. Lower this to simulate more rational leadership." />
              </label>
              <input type="range" min={10} max={150} value={Math.round(spinWeight * 100)}
                onChange={(e) => setSpinWeight(Number(e.target.value) / 100)}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Teams ({teams.length}/10)</h3>
          <button onClick={addTeam} disabled={teams.length >= 10}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/20 transition-colors disabled:opacity-40">
            <Plus size={14} /> Add Team
          </button>
        </div>

        {teams.map((team, idx) => (
          <div key={team.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Users size={18} className="text-zinc-400" />
              <input
                value={team.name}
                onChange={(e) => updateTeam(idx, { name: e.target.value })}
                className="bg-transparent border-b border-zinc-700 text-white font-medium text-lg focus:outline-none focus:border-amber-500 transition-colors"
              />
              <span className="text-xs text-zinc-500 ml-auto">ID: {team.id}</span>
              {teams.length > 2 && (
                <button onClick={() => removeTeam(idx)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Team Leader</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONAS.map((p) => (
                    <button key={p} onClick={() => updateTeam(idx, { leaderPersona: p })}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${team.leaderPersona === p
                        ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'}`}>
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: PERSONA_COLORS[p] }} />
                      {PERSONA_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Team Size</label>
                <input
                  type="range" min={3} max={20} value={team.memberCount}
                  onChange={(e) => updateTeam(idx, { memberCount: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <span className="text-sm text-zinc-300">{team.memberCount} members</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Persona Composition</label>
              <div className="space-y-2">
                {PERSONAS.map((p) => (
                  <div key={p} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-zinc-300 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: PERSONA_COLORS[p] }} />
                      {PERSONA_LABELS[p]}
                    </span>
                    <input
                      type="range" min={0} max={100} value={team.composition[p]}
                      onChange={(e) =>
                        updateTeam(idx, { composition: normalizeComposition(team.composition, p, Number(e.target.value)) })
                      }
                      className="flex-1 accent-amber-500"
                    />
                    <span className="w-10 text-right text-sm text-zinc-400">{team.composition[p]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relationship Matrix */}
      {teams.length > 1 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Leader Relationships</h3>
          <p className="text-sm text-zinc-500 mb-4">Define how team leaders interact — allied leaders amplify each other's narratives, adversarial leaders attack.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-zinc-500 pb-2 pr-3"></th>
                  {teams.map((t) => (
                    <th key={t.id} className="text-center text-zinc-400 pb-2 px-1 text-xs">{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((rowTeam, ri) => (
                  <tr key={rowTeam.id}>
                    <td className="text-zinc-400 pr-3 py-1 whitespace-nowrap text-xs">{rowTeam.name}</td>
                    {teams.map((colTeam, ci) => (
                      <td key={colTeam.id} className="text-center px-1 py-1">
                        {ri === ci ? (
                          <span className="text-zinc-700">—</span>
                        ) : ri < ci ? (
                          <button
                            onClick={() => {
                              const cur = getRel(rowTeam.id, colTeam.id);
                              const next: RelationshipState = cur === 'neutral' ? 'allied' : cur === 'allied' ? 'adversarial' : 'neutral';
                              setRel(rowTeam.id, colTeam.id, next);
                            }}
                            className={`px-2 py-0.5 rounded border text-xs font-medium transition-all ${relColors[getRel(rowTeam.id, colTeam.id)]}`}
                          >
                            {getRel(rowTeam.id, colTeam.id) === 'allied' ? '🤝' : getRel(rowTeam.id, colTeam.id) === 'adversarial' ? '⚔️' : '—'}
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs ${relColors[getRel(rowTeam.id, colTeam.id)]}`}>
                            {getRel(rowTeam.id, colTeam.id) === 'allied' ? '🤝' : getRel(rowTeam.id, colTeam.id) === 'adversarial' ? '⚔️' : '—'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-600 mt-2">Click cells above the diagonal to cycle: Neutral → Allied → Adversarial</p>
        </div>
      )}

      <button onClick={handleRun}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black font-bold rounded-xl text-lg hover:bg-amber-400 transition-colors">
        <Play size={20} /> Run Simulation
      </button>
    </div>
  );
}
