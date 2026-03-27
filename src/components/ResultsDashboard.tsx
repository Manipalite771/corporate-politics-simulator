import { useState } from 'react';
import type { SimulationResult, Persona } from '../engine/types';
import { PERSONA_LABELS, PERSONA_COLORS } from '../engine/personas';
import { Trophy, Heart, AlertTriangle, RotateCcw, ArrowLeft, TrendingUp, ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  result: SimulationResult;
  onRestart: () => void;
  onBack: () => void;
}

function MiniChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = height - ((v - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

type LogFilter = 'all' | 'audits' | 'credit' | 'flight' | 'sabotage';

function AuditLog({ result }: { result: SimulationResult }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LogFilter>('all');
  const [expandedTick, setExpandedTick] = useState<number | null>(null);

  const enrichedTicks = result.tickLogs.map((log) => {
    const events: { tick: number; team: string; text: string; category: LogFilter }[] = [];

    if (log.auditTriggered) {
      events.push({ tick: log.tick, team: '—', text: 'Audit triggered by leadership', category: 'audits' });
      for (const p of log.auditPenalties) {
        events.push({ tick: log.tick, team: '—', text: p, category: 'audits' });
      }
    }

    for (const t of log.teams) {
      for (const e of t.memberEvents) {
        let category: LogFilter = 'sabotage';
        if (e.toLowerCase().includes('credit') || e.toLowerCase().includes('claimed')) category = 'credit';
        if (e.toLowerCase().includes('left the organization') || e.toLowerCase().includes('flight')) category = 'flight';
        events.push({ tick: log.tick, team: t.teamName, text: e, category });
      }
    }

    return { tick: log.tick, events };
  });

  const ticksWithEvents = enrichedTicks.filter((t) => t.events.length > 0);

  const filtered = ticksWithEvents.map((t) => ({
    ...t,
    events: filter === 'all' ? t.events : t.events.filter((e) => e.category === filter),
  })).filter((t) => t.events.length > 0);

  const totalEvents = ticksWithEvents.reduce((s, t) => s + t.events.length, 0);
  const auditCount = enrichedTicks.filter((t) => t.events.some((e) => e.category === 'audits')).length;

  const categoryColors: Record<LogFilter, string> = {
    all: 'text-zinc-300',
    audits: 'text-amber-400',
    credit: 'text-red-400',
    flight: 'text-orange-400',
    sabotage: 'text-zinc-400',
  };

  const categoryIcons: Record<string, string> = {
    audits: '🔍',
    credit: '🎭',
    flight: '🚪',
    sabotage: '⚙️',
  };

  const filters: { key: LogFilter; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'audits', label: 'Audits' },
    { key: 'credit', label: 'Credit Theft' },
    { key: 'flight', label: 'Departures' },
    { key: 'sabotage', label: 'Sabotage / Traits' },
  ];

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/30 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <ScrollText size={20} className="text-zinc-400" />
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">Simulation Audit Log</h3>
            <p className="text-xs text-zinc-500">{totalEvents} events across {ticksWithEvents.length} ticks &middot; {auditCount} audit{auditCount !== 1 ? 's' : ''} triggered</p>
          </div>
        </div>
        {open ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-zinc-800">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 py-3">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filter === f.key
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-zinc-800/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-600 py-4 text-center">No events match this filter.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
              {filtered.map((tickGroup) => (
                <div key={tickGroup.tick}>
                  <button
                    onClick={() => setExpandedTick(expandedTick === tickGroup.tick ? null : tickGroup.tick)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <span className="text-xs font-mono font-bold text-amber-500/70 w-14 shrink-0">Tick {tickGroup.tick}</span>
                    <span className="text-xs text-zinc-500">{tickGroup.events.length} event{tickGroup.events.length !== 1 ? 's' : ''}</span>
                    <div className="flex gap-1 ml-auto">
                      {[...new Set(tickGroup.events.map((e) => e.category))].map((cat) => (
                        <span key={cat} className="text-[10px]">{categoryIcons[cat] ?? '•'}</span>
                      ))}
                    </div>
                    {expandedTick === tickGroup.tick ? <ChevronUp size={12} className="text-zinc-600" /> : <ChevronDown size={12} className="text-zinc-600" />}
                  </button>

                  {expandedTick === tickGroup.tick && (
                    <div className="ml-4 pl-4 border-l border-zinc-800 space-y-1 pb-2">
                      {tickGroup.events.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 py-0.5">
                          <span className="text-[10px] mt-0.5">{categoryIcons[ev.category] ?? '•'}</span>
                          {ev.team !== '—' && (
                            <span className="text-[10px] font-medium text-zinc-500 shrink-0 w-20 truncate">[{ev.team}]</span>
                          )}
                          <span className={`text-xs ${categoryColors[ev.category]}`}>{ev.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsDashboard({ result, onRestart, onBack }: Props) {
  const narrativeWinner = result.finalScores.find((s) => s.teamId === result.narrativeWarWinner) ?? result.finalScores[0];
  const healthWinner = result.finalScores.find((s) => s.teamId === result.companyHealthWinner) ?? result.finalScores[0];

  const lastTickTeams = result.tickLogs[result.tickLogs.length - 1]?.teams ?? [];
  const narrativeWinnerLog = lastTickTeams.find(
    (t) => t.teamId === result.narrativeWarWinner
  ) ?? lastTickTeams[0];
  const healthWinnerLog = lastTickTeams.find(
    (t) => t.teamId === result.companyHealthWinner
  ) ?? lastTickTeams[0];

  const sorted = [...result.finalScores].sort((a, b) => b.tns - a.tns);

  const tnsHistory: Record<string, number[]> = {};
  const healthHistory: Record<string, number[]> = {};
  for (const score of result.finalScores) {
    tnsHistory[score.teamId] = [];
    healthHistory[score.teamId] = [];
  }
  for (const log of result.tickLogs) {
    for (const t of log.teams) {
      tnsHistory[t.teamId]?.push(t.cumulativeTNS);
      healthHistory[t.teamId]?.push(t.companyHealth);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-black text-white">Simulation Results</h2>
      </div>

      {/* Divergence Alert */}
      {result.divergence && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle size={28} className="text-red-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-red-300 mb-1">Narrative Divergence Detected</h3>
            <p className="text-sm text-red-400/80">
              The team that won the narrative war is <strong>not</strong> the team that contributed most to company health.
              This is the core lesson: in a politics-heavy environment, the story that leadership believes often diverges
              from organizational reality. The winners of attention and resources may not be the ones delivering real value.
            </p>
          </div>
        </div>
      )}

      {!result.divergence && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-start gap-4">
          <Trophy size={28} className="text-emerald-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-emerald-300 mb-1">Narrative Aligned with Reality</h3>
            <p className="text-sm text-emerald-400/80">
              The narrative war winner is also the top contributor to company health.
              This typically occurs when Star leaders occupy enough bottleneck positions to ensure
              high-performance narratives survive the filtration process.
            </p>
          </div>
        </div>
      )}

      {/* Winner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900/70 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={22} className="text-amber-400" />
            <h3 className="text-lg font-bold text-amber-300">Narrative War Winner</h3>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PERSONA_COLORS[narrativeWinnerLog.leaderPersona] }} />
            <span className="text-2xl font-black text-white">{narrativeWinner.teamName}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-xs text-zinc-500">Total Narrative Score</div>
              <div className="text-xl font-bold text-amber-400">{narrativeWinner.tns.toFixed(0)}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-xs text-zinc-500">Leader Type</div>
              <div className="text-xl font-bold" style={{ color: PERSONA_COLORS[narrativeWinnerLog.leaderPersona] }}>
                {PERSONA_LABELS[narrativeWinnerLog.leaderPersona]}
              </div>
            </div>
          </div>
          <MiniChart data={tnsHistory[result.narrativeWarWinner]} color="#f59e0b" />
          <div className="text-[10px] text-zinc-600 mt-1">TNS over time</div>
        </div>

        <div className="bg-zinc-900/70 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={22} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-emerald-300">Company Health Winner</h3>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PERSONA_COLORS[healthWinnerLog.leaderPersona] }} />
            <span className="text-2xl font-black text-white">{healthWinner.teamName}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-xs text-zinc-500">Company Health Score</div>
              <div className="text-xl font-bold text-emerald-400">{healthWinner.companyHealth.toFixed(0)}</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-xs text-zinc-500">Leader Type</div>
              <div className="text-xl font-bold" style={{ color: PERSONA_COLORS[healthWinnerLog.leaderPersona] }}>
                {PERSONA_LABELS[healthWinnerLog.leaderPersona]}
              </div>
            </div>
          </div>
          <MiniChart data={healthHistory[result.companyHealthWinner]} color="#10b981" />
          <div className="text-[10px] text-zinc-600 mt-1">Company Health over time</div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-zinc-400" />
          <h3 className="text-lg font-bold text-white">Full Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-3 pr-4">Rank</th>
                <th className="text-left pb-3 pr-4">Team</th>
                <th className="text-left pb-3 pr-4">Leader</th>
                <th className="text-right pb-3 pr-4">TNS</th>
                <th className="text-right pb-3 pr-4">Health</th>
                <th className="text-right pb-3">TNS Trend</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((score, idx) => {
                const teamLog = lastTickTeams.find(
                  (t) => t.teamId === score.teamId
                ) ?? lastTickTeams[0];
                const isNarrativeWinner = score.teamId === result.narrativeWarWinner;
                const isHealthWinner = score.teamId === result.companyHealthWinner;

                return (
                  <tr key={score.teamId} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${idx === 0 ? 'text-amber-400' : 'text-zinc-500'}`}>#{idx + 1}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PERSONA_COLORS[teamLog.leaderPersona] }} />
                        <span className="font-medium text-zinc-200">{score.teamName}</span>
                        {isNarrativeWinner && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">🏆 Narrative</span>}
                        {isHealthWinner && <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">💚 Health</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: PERSONA_COLORS[teamLog.leaderPersona] + '22',
                        color: PERSONA_COLORS[teamLog.leaderPersona],
                      }}>
                        {PERSONA_LABELS[teamLog.leaderPersona]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-mono font-bold text-amber-400">{score.tns.toFixed(0)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-mono font-bold text-emerald-400">{score.companyHealth.toFixed(0)}</span>
                    </td>
                    <td className="py-3 w-24">
                      <MiniChart data={tnsHistory[score.teamId]} color={PERSONA_COLORS[teamLog.leaderPersona]} height={28} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <AuditLog result={result} />

      {/* Key Insight */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">What This Proves</h3>
        {result.divergence ? (
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              <strong className="text-white">The narrative war winner and the company health winner are different teams.</strong>{' '}
              This demonstrates the core thesis of the simulator: in organizations where leadership weighs optics (Spin)
              higher than results (Utility), the team that tells the best story wins resources and credit — not the team
              that delivers the most value.
            </p>
            <p>
              The Homophily Weight Matrix shows how team leaders filter information based on their own persona type.
              Survivor leaders suppress Star narratives (weight: 0.2). Politician leaders steal Performer credit (weight: 0.8 but
              with Credit Claiming trait active). Only Star leaders pass utility through faithfully while adding enough
              political packaging to survive the leadership evaluation.
            </p>
            <p>
              <strong className="text-amber-300">The solution:</strong> Place multiple, allied Stars in team leadership positions.
              Their synergy multiplier compounds high-utility, high-visibility narratives that can mathematically overwhelm
              the spin-heavy output of politician coalitions.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              <strong className="text-white">The narrative war and company health align.</strong>{' '}
              This configuration successfully channels real performance into the dominant narrative.
              This typically happens when Star leaders occupy bottleneck positions and are allied with each other,
              creating a synergy multiplier that amplifies utility-rich narratives.
            </p>
            <p>
              <strong className="text-emerald-300">This is the winning condition</strong> — the organization's
              perceived reality matches its actual output. Strategic leadership placement matters.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">
          <RotateCcw size={18} /> Run Another Simulation
        </button>
      </div>
    </div>
  );
}
