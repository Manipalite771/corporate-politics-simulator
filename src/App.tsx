import { useState } from 'react';
import type { SimulationConfig, SimulationResult } from './engine/types';
import type { ScenarioPreset } from './engine/scenarios';
import { runSimulation } from './engine/simulation';
import ScenarioSelector from './components/ScenarioSelector';
import ConfigPanel from './components/ConfigPanel';
import SimulationViewer from './components/SimulationViewer';
import ResultsDashboard from './components/ResultsDashboard';
import AboutPage from './components/AboutPage';

type Screen = 'home' | 'config' | 'running' | 'results' | 'about';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRun = (cfg: SimulationConfig) => {
    setConfig(cfg);
    const simResult = runSimulation(cfg);
    setResult(simResult);
    setScreen('running');
  };

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    handleRun(scenario.config);
  };

  const handleCustom = () => {
    setConfig(null);
    setScreen('config');
  };

  const handleGoHome = () => {
    setScreen('home');
    setConfig(null);
    setResult(null);
  };

  const handleBackToConfig = () => {
    setScreen('config');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Breadcrumb */}
          {screen !== 'home' ? (
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <button onClick={handleGoHome} className="hover:text-zinc-400 transition-colors">Home</button>
              {(screen === 'running' || screen === 'results') && (
                <>
                  <span>/</span>
                  <button onClick={handleBackToConfig} className="hover:text-zinc-400 transition-colors">Configuration</button>
                </>
              )}
              <span>/</span>
              <span className="text-zinc-400">
                {screen === 'config' && 'Configuration'}
                {screen === 'running' && 'Simulation'}
                {screen === 'results' && 'Results'}
                {screen === 'about' && 'About'}
              </span>
            </div>
          ) : <div />}

          {screen !== 'about' && (
            <button onClick={() => setScreen('about')} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              About & How It Works
            </button>
          )}
        </div>

        {screen === 'home' && (
          <ScenarioSelector onSelectScenario={handleSelectScenario} onCustom={handleCustom} />
        )}

        {screen === 'config' && (
          <ConfigPanel
            onRun={handleRun}
            onBack={handleGoHome}
            initialConfig={config ?? undefined}
          />
        )}

        {screen === 'running' && result && (
          <SimulationViewer
            result={result}
            onFinish={() => setScreen('results')}
            onRestart={handleBackToConfig}
          />
        )}

        {screen === 'results' && result && (
          <ResultsDashboard
            result={result}
            onRestart={handleGoHome}
            onBack={handleBackToConfig}
          />
        )}

        {screen === 'about' && (
          <AboutPage onBack={handleGoHome} />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-700">
          Corporate Politics Simulator — Deterministic Narrative Warfare Engine
          <br />
          Based on Yu-kai Chou's Corporate Player Types & CIA Simple Sabotage Field Manual
          <br />
          <button onClick={() => setScreen('about')} className="mt-1 text-zinc-600 hover:text-zinc-400 underline underline-offset-2 transition-colors">
            About & How It Works
          </button>
        </div>
      </div>
    </div>
  );
}
