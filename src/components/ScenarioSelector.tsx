import { useState } from 'react';
import { SCENARIOS, type ScenarioPreset } from '../engine/scenarios';
import { PERSONA_LABELS, PERSONA_COLORS } from '../engine/personas';
import { Play, Settings, Zap, AlertTriangle, Trophy } from 'lucide-react';
import type { Persona } from '../engine/types';

interface Props {
  onSelectScenario: (scenario: ScenarioPreset) => void;
  onCustom: () => void;
}

const SCENARIO_ICONS = [AlertTriangle, Zap, Trophy];

function ExpandableText({ text, clampClass = 'line-clamp-3' }: { text: string; clampClass?: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className={`text-xs text-zinc-500 ${expanded ? '' : clampClass}`}>{text}</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="text-[11px] text-amber-500/70 hover:text-amber-400 cursor-pointer mt-0.5 inline-block focus:outline-none focus:underline"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}

export default function ScenarioSelector({ onSelectScenario, onCustom }: Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Corporate Politics<br />
          <span className="text-amber-400">Simulator</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Build your org. Assign the leaders. Set the rivalries. Hit play and see which team
          wins the narrative war — and whether the best work actually gets noticed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {SCENARIOS.map((scenario, idx) => {
          const Icon = SCENARIO_ICONS[idx];
          const leaderTypes = scenario.config.teams.map((t) => t.leaderPersona);
          const leaderCounts: Partial<Record<Persona, number>> = {};
          for (const lp of leaderTypes) {
            leaderCounts[lp] = (leaderCounts[lp] ?? 0) + 1;
          }

          return (
            <div
              key={scenario.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectScenario(scenario)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectScenario(scenario); } }}
              aria-label={`Run scenario: ${scenario.name}`}
              className="group bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 text-left hover:border-amber-500/40 hover:bg-zinc-900 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={20} className="text-amber-500" />
                <span className="text-xs font-medium text-amber-500/80 uppercase tracking-wider">Scenario {String.fromCharCode(65 + idx)}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                {scenario.name}
              </h3>
              <p className="text-sm text-zinc-500 mb-3">{scenario.subtitle}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(leaderCounts).map(([persona, count]) => (
                  <span key={persona} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PERSONA_COLORS[persona as Persona] }} />
                    {count}x {PERSONA_LABELS[persona as Persona]} TL
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <ExpandableText text={scenario.description} />
              </div>

              <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
                <span className="text-xs font-medium text-zinc-400 block mb-1">Expected Outcome</span>
                <ExpandableText text={scenario.expectedOutcome} />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 text-sm font-semibold bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 group-hover:bg-amber-500/20 transition-all">
                <Play size={14} /> Run This Scenario
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onCustom}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <Settings size={18} /> Build Custom Simulation
        </button>
      </div>
    </div>
  );
}
