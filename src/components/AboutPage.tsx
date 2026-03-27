import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, Users, Scale, Cog, Zap, Shield, TrendingUp, Workflow } from 'lucide-react';
import { PERSONA_LABELS, PERSONA_COLORS, PERSONA_DESCRIPTIONS, HOMOPHILY_WEIGHTS, BASE_GENERATION, PERSONA_TRAITS } from '../engine/personas';
import type { Persona } from '../engine/types';

interface Props {
  onBack: () => void;
}

const PERSONAS: Persona[] = ['star', 'performer', 'politician', 'survivor'];

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-zinc-800/30 transition-colors rounded-2xl"
      >
        <Icon size={20} className="text-amber-500 shrink-0" />
        <h3 className="text-lg font-bold text-white flex-1">{title}</h3>
        {open ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AboutPage({ onBack }: Props) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-black text-white">About the Simulator</h2>
      </div>

      {/* Intro */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">What is this?</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Ever wondered what would happen if your entire org was dropped into a simulation? The Corporate Politics
          Simulator lets you do exactly that. Pick your team sizes, assign leader types, set up alliances and rivalries,
          and hit play — then watch how the <strong className="text-zinc-200">narrative war</strong> unfolds
          over 50+ rounds.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Every employee falls into one of four archetypes — <strong className="text-amber-300">Stars</strong>,{' '}
          <strong className="text-blue-400">Performers</strong>, <strong className="text-red-400">Politicians</strong>,
          and <strong className="text-zinc-300">Survivors</strong> — each with their own strengths, quirks, and
          dysfunction patterns. The fun part: <strong className="text-zinc-200">the team that does the best work doesn't
          always win.</strong> Sometimes the best storytellers do. Sometimes nobody wins and the whole org drowns in
          meetings and blame-shifting.
        </p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Try the pre-built scenarios, build your own company from scratch, or recreate your actual org and see what the
          simulation predicts. It's a great exercise for teams, offsites, or just satisfying your curiosity about
          <strong className="text-zinc-200"> why certain orgs feel the way they do.</strong>
        </p>
      </div>

      {/* Foundations */}
      <Section title="Theoretical Foundations" icon={BookOpen} defaultOpen={true}>
        <div className="space-y-5 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h4 className="font-semibold text-zinc-200 mb-2">Yu-kai Chou's Corporate Player Types</h4>
            <p className="mb-2">
              The four persona archetypes are derived from Yu-kai Chou's Performance vs. Politics matrix. Chou, creator of
              the Octalysis Framework for gamification and behavioral design, categorizes corporate employees along two axes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 ml-2">
              <li><strong className="text-zinc-300">Performance</strong> — the ability to execute tasks, solve problems, and deliver measurable output</li>
              <li><strong className="text-zinc-300">Politics</strong> — the proactive effort to build relationships, manage impressions, and strategically frame information</li>
            </ul>
            <p className="mt-2">
              The high/low combinations of these two axes produce four distinct archetypes: Stars (high/high),
              Performers (high/low), Politicians (low/high), and Survivors (low/low). Crucially, Chou observes that
              how an organization rewards political behavior directly shapes its culture — rewarding spin tends to
              breed more spin, demotivating genuine performers into doing the minimum.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2">The Simple Sabotage Field Manual (1944)</h4>
            <p className="mb-2">
              The negative traits assigned to Politicians and Survivors are drawn from the Office of Strategic Services'
              declassified wartime manual on organizational disruption. Far from dramatic physical sabotage, the manual
              catalogs mundane bureaucratic behaviors that silently destroy productivity:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 ml-2">
              <li>Insisting everything goes through "proper channels" and committees</li>
              <li>Making unnecessarily long speeches and raising irrelevant issues</li>
              <li>Haggling over precise wording of communications</li>
              <li>Reopening decisions that were already settled</li>
              <li>Advocating "caution" to delay every initiative</li>
              <li>Multiplying paperwork and approval requirements</li>
            </ul>
            <p className="mt-2">
              The simulator treats these as a behavioral failure-mode catalog — not instructions, but a taxonomy of
              what organizational dysfunction actually looks like in practice. These behaviors are encoded as negative
              traits with specific trigger probabilities and productivity penalties.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2">Octalysis Core Drives</h4>
            <p>
              Each persona's motivational structure maps to specific Core Drives from the Octalysis Framework.
              Stars are driven by Epic Meaning and Accomplishment. Performers by pure Mastery and Empowerment.
              Politicians by Social Influence and Relatedness. Survivors by Ownership (collecting a paycheck) and
              Loss Avoidance (doing just enough to not get fired). These drives determine how each persona generates
              narrative output and which behaviors they exhibit under pressure.
            </p>
          </div>
        </div>
      </Section>

      {/* The Four Archetypes */}
      <Section title="The Four Archetypes" icon={Users}>
        <div className="space-y-5">
          {PERSONAS.map((p) => {
            const traits = PERSONA_TRAITS[p];
            const [baseU, baseS] = BASE_GENERATION[p];
            return (
              <div key={p} className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: PERSONA_COLORS[p] }} />
                  <div>
                    <h4 className="font-bold text-zinc-100 text-base">{PERSONA_LABELS[p]}</h4>
                    <p className="text-xs text-zinc-500">{PERSONA_DESCRIPTIONS[p]}</p>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    <div className="text-[10px] text-zinc-600">Base output per tick</div>
                    <div className="text-xs">
                      <span className="text-blue-400">Utility {baseU}</span>
                      <span className="text-zinc-600 mx-1">|</span>
                      <span className="text-red-400">Spin {baseS}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h5 className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider mb-1.5">Positive Traits</h5>
                    <div className="space-y-1">
                      {traits.positive.map((t) => (
                        <div key={t.def.name} className="text-xs text-zinc-500 flex gap-1.5">
                          <span className="text-emerald-500/60 shrink-0">+</span>
                          <span><strong className="text-zinc-400">{t.def.name}</strong> — {t.def.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-semibold text-red-400/80 uppercase tracking-wider mb-1.5">Negative Traits</h5>
                    <div className="space-y-1">
                      {traits.negative.map((t) => (
                        <div key={t.def.name} className="text-xs text-zinc-500 flex gap-1.5">
                          <span className="text-red-500/60 shrink-0">−</span>
                          <span><strong className="text-zinc-400">{t.def.name}</strong> — {t.def.description}
                            {t.effect.triggerProbability < 1.0 && (
                              <span className="text-zinc-600"> ({(t.effect.triggerProbability * 100).toFixed(0)}% chance)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* The Homophily Filter */}
      <Section title="The Homophily Filter (Why Leaders Distort Reality)" icon={Scale}>
        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <p>
            The defining mechanic of the simulator is the <strong className="text-zinc-200">communication bottleneck</strong>.
            Leadership only hears from one person per team: the Team Leader. Regardless of how much real work a team produces,
            the leader's persona determines what gets passed up and what gets suppressed.
          </p>
          <p>
            This is modeled through a <strong className="text-zinc-200">Homophily Weight Matrix</strong> — leaders
            unconsciously amplify narratives from people like themselves and discount narratives from people unlike themselves.
            The weights below show the multiplier each leader type applies to each member type's narrative:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Leader ↓ / Member →</th>
                  {PERSONAS.map((p) => (
                    <th key={p} className="text-center py-2 px-3 font-medium" style={{ color: PERSONA_COLORS[p] }}>
                      {PERSONA_LABELS[p]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERSONAS.map((leader) => (
                  <tr key={leader} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-4 font-medium" style={{ color: PERSONA_COLORS[leader] }}>
                      {PERSONA_LABELS[leader]} TL
                    </td>
                    {PERSONAS.map((member) => {
                      const w = HOMOPHILY_WEIGHTS[leader][member];
                      const intensity = w >= 0.9 ? 'text-emerald-400' : w >= 0.5 ? 'text-amber-400' : 'text-red-400';
                      return (
                        <td key={member} className={`text-center py-2 px-3 font-mono font-bold ${intensity}`}>
                          {w.toFixed(1)}x
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-800 text-xs text-zinc-500 space-y-1">
            <p><strong className="text-zinc-300">Reading the table:</strong> A Survivor TL applies 0.2x weight to Star output (effectively silencing it)
              but 1.0x to fellow Survivor narratives. A Politician TL passes Performer utility at 0.8x but triggers
              Credit Claiming, stealing the credit. Only Star TLs pass both Stars and Performers through at full weight.</p>
          </div>
        </div>
      </Section>

      {/* Simulation Engine Deep Dive */}
      <Section title="Deep Dive: How the Simulation Runs" icon={Cog}>
        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">1</span>
              Initialization
            </h4>
            <p>
              Teams are populated based on your configured composition percentages. Each member is assigned a persona,
              a morale value (0.8–1.0), and their persona's 10 traits. The leader is locked to the persona you chose.
              The relationship matrix between leaders is stored. A seeded random number generator ensures reproducibility.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">2</span>
              Per-Tick: Member Narrative Generation
            </h4>
            <p className="mb-2">
              Each tick, every active member generates a two-dimensional Narrative Vector: <strong className="text-blue-400">[Utility, Spin]</strong>.
              The base rates differ by persona:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3">
              {PERSONAS.map((p) => {
                const [u, s] = BASE_GENERATION[p];
                return (
                  <div key={p} className="bg-zinc-800/40 rounded-lg p-2 text-center">
                    <span className="text-xs font-medium" style={{ color: PERSONA_COLORS[p] }}>{PERSONA_LABELS[p]}</span>
                    <div className="text-xs mt-0.5 text-zinc-500">[<span className="text-blue-400">{u}</span>, <span className="text-red-400">{s}</span>]</div>
                  </div>
                );
              })}
            </div>
            <p>
              Then, each member's 10 traits are rolled against their trigger probabilities (modified by team morale,
              Star presence, and leader type). Positive traits add utility or reduce friction. Negative traits subtract
              utility, add bureaucratic drag, or generate harmful spin. Special interactions fire here: Politician Credit
              Claiming steals Performer output, repeated theft triggers Performer Flight Risk (they leave permanently).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">3</span>
              Per-Tick: Leader Filtration (The Bottleneck)
            </h4>
            <p>
              The raw team output never reaches leadership directly. The Team Leader applies their Homophily Weight Matrix
              to every member's contribution. A Survivor leader multiplies Star output by 0.2x (suppressing it) while
              passing Survivor complaints through at 1.0x. A Politician leader passes Performer utility at 0.8x but
              attaches their own name to it. A Star leader amplifies all utility by 1.2x and adds a modest spin
              multiplier of 1.1x — enough packaging to be heard.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">4</span>
              Per-Tick: Coalition Effects
            </h4>
            <p className="mb-2">
              Filtered narratives then pass through inter-team relationship modifiers:
            </p>
            <ul className="space-y-1.5 ml-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">Allied</span>
                <span>Leaders amplify each other. Utility gets +10% and spin gets +15% of the ally's filtered output, further multiplied by the synergy coefficient (default 1.25x).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 shrink-0">Neutral</span>
                <span>No effect. Narratives pass through unchanged.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 shrink-0">Adversarial</span>
                <span>The enemy's spin erodes your narrative. Their spin × sabotage coefficient (default 0.35) is subtracted from your utility (50%) and spin (30%). This is how Politician coalitions dismantle lone Stars.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">5</span>
              Per-Tick: Leadership Scoring (TNS)
            </h4>
            <p>
              The Effective Narrative (post-coalition) is scored by leadership using the formula:
            </p>
            <div className="bg-zinc-800/60 rounded-lg p-3 my-3 font-mono text-center text-xs">
              <span className="text-amber-400">Total Narrative Score</span> = (<span className="text-blue-400">ω₁</span> × Utility) + (<span className="text-red-400">ω₂</span> × Spin)
            </div>
            <p>
              By default, <span className="text-blue-400">ω₁ = 0.85</span> and <span className="text-red-400">ω₂ = 1.15</span>.
              Spin is weighted ~35% higher than utility, reflecting the empirical reality that polished presentations
              and managed optics reliably outperform raw data in executive decision-making. This is the mathematical
              engine that makes Politicians competitive despite producing almost no real work.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">6</span>
              Per-Tick: Company Health (Ground Truth)
            </h4>
            <p>
              Separately from what leadership sees, the simulator tracks actual company health — computed from
              raw utility (before filtration), discounted by the team's politics climate. A team can have great TNS
              but terrible company health contribution if the narrative is mostly spin. This dual tracking is what
              makes the final results meaningful: the narrative war winner and the company health winner are often
              different teams.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">7</span>
              Per-Tick: Audits (Optional Truth Check)
            </h4>
            <p>
              Each tick has a configurable probability of triggering an audit. When an audit fires, leadership
              examines the spin ratio of each team's effective narrative. Teams whose spin exceeds 65% of their
              total narrative receive a 15% penalty to their cumulative score. This prevents "politics always wins"
              fatalism and rewards balanced narratives. Higher audit probability simulates more transparent or
              data-driven organizations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center">8</span>
              Final Resolution
            </h4>
            <p>
              After all ticks complete, the team with the highest cumulative TNS wins the <strong className="text-amber-300">Narrative War</strong>.
              The team with the highest cumulative company health contribution wins the <strong className="text-emerald-300">Company Health</strong> award.
              When these two diverge — which they reliably do when Politicians or Survivors hold leadership — the simulator
              has demonstrated its core thesis. When they align, it proves that strategic leadership placement works.
            </p>
          </div>
        </div>
      </Section>

      {/* Key Mechanics Summary */}
      <Section title="Key Mechanics at a Glance" icon={Zap}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Narrative Vector', desc: 'Every member generates [Utility, Spin] each tick. Utility = real work. Spin = political packaging.', icon: TrendingUp },
            { label: 'Homophily Filter', desc: 'Leaders unconsciously suppress unlike-minded members and amplify similar ones. This is the bottleneck that distorts reality.', icon: Scale },
            { label: 'Coalition Dynamics', desc: 'Allied leaders compound each other\'s narratives. Adversarial leaders erode each other\'s. Factions matter.', icon: Users },
            { label: 'Corporate Receptivity', desc: 'Leadership weighs Spin 35% higher than Utility by default. Optics beat substance unless audits catch it.', icon: Workflow },
            { label: 'Credit Theft & Flight', desc: 'Politician leaders steal Performer credit. After repeated theft, Performers leave permanently — draining real output.', icon: Shield },
            { label: 'Bureaucratic Drag', desc: 'Survivor and Politician negative traits accumulate friction that compounds over time, slowing the entire team.', icon: Cog },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
              <item.icon size={16} className="text-amber-500/70 mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-zinc-200">{item.label}</span>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <button onClick={onBack}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black font-bold rounded-xl text-lg hover:bg-amber-400 transition-colors">
        <ArrowLeft size={20} /> Back to Simulator
      </button>
    </div>
  );
}
