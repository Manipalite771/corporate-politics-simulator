import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimulationResult, TickLog, Persona } from '../engine/types';
import { PERSONA_LABELS, PERSONA_COLORS } from '../engine/personas';
import { Play, Pause, SkipForward, RotateCcw, ChevronRight, CheckCircle2, Shield, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  result: SimulationResult;
  onFinish: () => void;
  onRestart: () => void;
}

function NarrativeBar({ label, utility, spin, maxVal }: { label: string; utility: number; spin: number; maxVal: number }) {
  const total = utility + spin;
  const barScale = maxVal > 0 ? (total / maxVal) * 100 : 0;
  const uPct = total > 0 ? (utility / total) * barScale : 0;
  const sPct = total > 0 ? (spin / total) * barScale : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500">
          <span className="text-blue-400">Utility</span> {utility.toFixed(1)} | <span className="text-red-400">Spin</span> {spin.toFixed(1)}
        </span>
      </div>
      <div className="flex gap-0.5 h-4 rounded-md overflow-hidden bg-zinc-800">
        <div className="bg-blue-500/80 transition-all duration-500 rounded-l-md" style={{ width: `${uPct}%` }} />
        <div className="bg-red-500/70 transition-all duration-500 rounded-r-md" style={{ width: `${sPct}%` }} />
      </div>
    </div>
  );
}

function ReadingGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-zinc-800/30 transition-colors rounded-xl">
        <HelpCircle size={14} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">How to read this view</span>
        {open ? <ChevronUp size={14} className="text-zinc-600 ml-auto" /> : <ChevronDown size={14} className="text-zinc-600 ml-auto" />}
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
          <div className="space-y-2.5">
            <h4 className="font-semibold text-zinc-300 text-sm">Bar Colors</h4>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-500/80 shrink-0" />
              <span><strong className="text-blue-400">Utility (Blue)</strong> — Real productive output. Work that actually benefits the company.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/70 shrink-0" />
              <span><strong className="text-red-400">Spin (Red)</strong> — Political packaging, optics, and impression management. Not real work.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500/50 shrink-0" />
              <span><strong className="text-amber-400">Narrative Score</strong> — The combined score leadership sees (Utility + Spin, weighted). Determines who "wins."</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/50 shrink-0" />
              <span><strong className="text-emerald-400">Company Health</strong> — Actual value delivered to the organization, independent of spin.</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-semibold text-zinc-300 text-sm">Narrative Pipeline (per team card)</h4>
            <div className="space-y-1.5 pl-2 border-l-2 border-zinc-800">
              <p><strong className="text-zinc-300">Raw Narrative</strong> — Total output from all team members before any filtering.</p>
              <p><strong className="text-zinc-300">Homophily Filter</strong> — The team leader filters what goes up based on their persona. E.g. a Survivor leader suppresses Star output.</p>
              <p><strong className="text-zinc-300">Coalition Effects</strong> — Allied leaders amplify each other; adversarial leaders erode each other's narrative.</p>
              <p><strong className="text-zinc-300">Effective Narrative</strong> — What leadership actually receives and scores.</p>
            </div>
            <h4 className="font-semibold text-zinc-300 text-sm mt-3">Team Metrics</h4>
            <div className="space-y-1">
              <p><strong className="text-amber-400">TNS</strong> — Total Narrative Score for this tick. Higher = more leadership attention.</p>
              <p><strong className="text-orange-400">Friction</strong> — Bureaucratic drag from negative traits. Slows real output.</p>
              <p><strong className="text-zinc-300">Active</strong> — Members still working vs. total. Performers may leave if credit is repeatedly stolen.</p>
              <p><strong className="text-red-400">Politics Climate</strong> — How politicized the team is. High = more dysfunction, less real work.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPanel({ team, maxNarrative, rank }: {
  team: TickLog['teams'][number];
  maxNarrative: number;
  rank: number;
}) {
  const color = PERSONA_COLORS[team.leaderPersona as Persona];

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 w-5">#{rank}</span>
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-white text-sm">{team.teamName}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: color + '22', color }}>
          {PERSONA_LABELS[team.leaderPersona]} TL
        </span>
      </div>

      <NarrativeBar label="Raw Narrative" utility={team.rawNarrative.utility} spin={team.rawNarrative.spin} maxVal={maxNarrative} />
      <div className="my-1.5 flex items-center gap-1 text-zinc-600">
        <ChevronRight size={12} />
        <span className="text-[10px] uppercase tracking-wider">Homophily Filter</span>
      </div>
      <NarrativeBar label="Filtered → Leadership" utility={team.filteredNarrative.utility} spin={team.filteredNarrative.spin} maxVal={maxNarrative} />
      <div className="my-1.5 flex items-center gap-1 text-zinc-600">
        <ChevronRight size={12} />
        <span className="text-[10px] uppercase tracking-wider">Coalition Effects</span>
      </div>
      <NarrativeBar label="Effective Narrative" utility={team.effectiveNarrative.utility} spin={team.effectiveNarrative.spin} maxVal={maxNarrative} />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 leading-tight">Narrative Score</div>
          <div className="text-sm font-bold text-amber-400">{team.tns.toFixed(1)}</div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 leading-tight">Bureaucratic Drag</div>
          <div className="text-sm font-bold text-orange-400">{(team.bureaucracyLoad * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-2">
          <div className="text-[10px] text-zinc-500 leading-tight">Members Active</div>
          <div className="text-sm font-bold text-zinc-300">{team.activeMembers}/{team.totalMembers}</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5">
          <span>Politics Climate</span>
          <span>{(team.politicsClimate * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500/60 transition-all duration-500 rounded-full" style={{ width: `${team.politicsClimate * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function SimulationViewer({ result, onFinish, onRestart }: Props) {
  const [currentTick, setCurrentTick] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tickData: TickLog | null = currentTick > 0 ? result.tickLogs[currentTick - 1] : null;

  const stopPlaying = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (playing && currentTick < result.totalTicks) {
      intervalRef.current = setInterval(() => {
        setCurrentTick((prev) => {
          if (prev >= result.totalTicks) {
            stopPlaying();
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return stopPlaying;
  }, [playing, speed, result.totalTicks, stopPlaying, currentTick]);

  useEffect(() => {
    if (currentTick >= result.totalTicks) {
      setPlaying(false);
      stopPlaying();
    }
  }, [currentTick, result.totalTicks, stopPlaying]);

  const maxNarrative = tickData
    ? Math.max(...tickData.teams.map((t) => Math.max(
        t.rawNarrative.utility + t.rawNarrative.spin,
        t.filteredNarrative.utility + t.filteredNarrative.spin,
        t.effectiveNarrative.utility + t.effectiveNarrative.spin,
        1
      )))
    : 1;

  const sortedTeams = tickData
    ? [...tickData.teams].sort((a, b) => b.cumulativeTNS - a.cumulativeTNS)
    : [];

  const cumulativeMax = tickData ? Math.max(...tickData.teams.map((t) => Math.max(t.cumulativeTNS, t.companyHealth, 1))) : 1;

  return (
    <div className="space-y-5">
      {/* Timeline & Controls */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">Simulation Running</h2>
          <span className="text-sm text-zinc-400">
            Tick <span className="text-amber-400 font-mono font-bold">{currentTick}</span> / {result.totalTicks}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setPlaying(!playing); }}
            aria-label={playing ? 'Pause simulation' : 'Play simulation'}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => { if (currentTick < result.totalTicks) setCurrentTick(currentTick + 1); }}
            disabled={currentTick >= result.totalTicks}
            aria-label="Step forward one tick"
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <SkipForward size={16} />
          </button>
          <button
            onClick={() => setCurrentTick(result.totalTicks)}
            disabled={currentTick >= result.totalTicks}
            aria-label="Skip to end"
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs font-bold"
          >
            ⏭
          </button>
          <button onClick={onRestart} aria-label="Back to configuration" className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50">
            <RotateCcw size={16} />
          </button>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Playback speed"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 ml-auto">
            <option value={100}>Fast</option>
            <option value={300}>Normal</option>
            <option value={600}>Slow</option>
            <option value={1200}>Very Slow</option>
          </select>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-300 rounded-full" style={{ width: `${(currentTick / result.totalTicks) * 100}%` }} />
        </div>
      </div>

      {/* Finished CTA — placed high so mobile users see it immediately */}
      {currentTick >= result.totalTicks && (
        <div className="bg-zinc-900/70 border border-emerald-500/30 rounded-xl p-5 text-center space-y-3">
          <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Simulation Complete</h3>
          <p className="text-sm text-zinc-400">All {result.totalTicks} ticks processed. View the full results breakdown.</p>
          <button onClick={onFinish}
            className="px-6 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">
            View Results
          </button>
        </div>
      )}

      {/* Reading Guide */}
      <ReadingGuide />

      {/* Audit notification */}
      {tickData?.auditTriggered && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
          <Shield size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-amber-300">Audit Triggered at Tick {currentTick}!</span>
            {tickData.auditPenalties.map((p, i) => (
              <p key={i} className="text-xs text-amber-400/70 mt-0.5">{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* Event Log */}
      {tickData && (() => {
        const events = tickData.teams.flatMap((t) =>
          t.memberEvents.map((e) => ({ team: t.teamName, event: e }))
        );
        if (events.length === 0) return null;
        return (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Events This Tick</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {events.slice(0, 8).map((ev, i) => (
                <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                  <span className="text-zinc-600 shrink-0">[{ev.team}]</span>
                  <span>{ev.event}</span>
                </div>
              ))}
              {events.length > 8 && (
                <span className="text-xs text-zinc-600">+{events.length - 8} more events...</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Cumulative Scoreboard */}
      {tickData && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Cumulative Standings</h3>
          <div className="space-y-2">
            {sortedTeams.map((team, idx) => {
              const tnsWidth = (team.cumulativeTNS / cumulativeMax) * 100;
              const healthWidth = (team.companyHealth / cumulativeMax) * 100;
              return (
                <div key={team.teamId} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                      <span className="w-4 text-center font-bold text-zinc-500">{idx + 1}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PERSONA_COLORS[team.leaderPersona] }} />
                      {team.teamName}
                    </span>
                    <span className="text-zinc-500">Narrative: {team.cumulativeTNS.toFixed(0)} | Health: {team.companyHealth.toFixed(0)}</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="bg-amber-500/50 rounded-sm transition-all duration-500" style={{ width: `${Math.max(tnsWidth * 0.5, 0.5)}%` }}
                      title={`Narrative Score: ${team.cumulativeTNS.toFixed(0)}`} />
                    <div className="bg-emerald-500/50 rounded-sm transition-all duration-500" style={{ width: `${Math.max(healthWidth * 0.5, 0.5)}%` }}
                      title={`Company Health: ${team.companyHealth.toFixed(0)}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/50" /> Narrative Score (TNS)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/50" /> Company Health</span>
          </div>
        </div>
      )}

      {/* Team Detail Cards */}
      {tickData && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedTeams.map((team, idx) => (
            <TeamPanel key={team.teamId} team={team} maxNarrative={maxNarrative} rank={idx + 1} />
          ))}
        </div>
      )}

    </div>
  );
}
