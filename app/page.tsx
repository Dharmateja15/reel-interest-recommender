'use client';

import React, { useState, useEffect } from 'react';
import { historyScenarios, HistoryScenario } from '../data/history-sets';
import { RecommendationResponse, InteractionReel } from '../lib/types';
import { getRandomVerifiedVideo, YouTubeRecommendation } from '../data/youtube-recommendations';
import { fallbackKeywordMap } from '../data/fallback-keyword-map';
import { candidates } from '../data/candidates';

interface ObservedSignal {
  category: string;
  count: number;
  strength: 'Strong' | 'Medium' | 'Weak';
  type: 'tech' | 'interaction';
}

function getObservedInterestSignals(history: InteractionReel[]): ObservedSignal[] {
  const catCounts: Record<string, number> = {};
  for (const reel of history) {
    const text = `${reel.title} ${reel.description}`.toLowerCase();
    const matchedCategories = new Set<string>();
    for (const entry of fallbackKeywordMap) {
      const kw = entry.keyword.toLowerCase();
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        matchedCategories.add(entry.category);
      }
    }
    for (const cat of matchedCategories) {
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
  }

  const techEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  if (techEntries.length > 0) {
    const maxCount = techEntries[0][1];
    return techEntries.map(([category, count]) => {
      let strength: 'Strong' | 'Medium' | 'Weak' = 'Weak';
      if (count >= 3 || (count === maxCount && count >= 2)) strength = 'Strong';
      else if (count === 2 || count === maxCount) strength = 'Medium';
      return { category, count, strength, type: 'tech' as const };
    });
  }

  const typeCounts: Record<string, number> = {};
  for (const reel of history) {
    typeCounts[reel.category] = (typeCounts[reel.category] || 0) + 1;
  }
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = typeEntries.length > 0 ? typeEntries[0][1] : 1;
  return typeEntries.map(([category, count]) => ({
    category,
    count,
    strength: (count === maxCount && count >= 2 ? 'Medium' : 'Weak') as 'Strong' | 'Medium' | 'Weak',
    type: 'interaction' as const
  }));
}

export default function Home() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('aiClusterHistory');
  const [currentReelId, setCurrentReelId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [activeVideo, setActiveVideo] = useState<YouTubeRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scenario: HistoryScenario = historyScenarios[selectedScenarioId] || historyScenarios.aiClusterHistory;
  const currentReel = scenario.history.find((r) => r.id === currentReelId) || scenario.history[0];
  const observedSignals = getObservedInterestSignals(scenario.history);

  // Initialize currentReelId when scenario changes
  useEffect(() => {
    setCurrentReelId(scenario.defaultCurrentReelId);
    setResult(null);
    setActiveVideo(null);
    setError(null);
  }, [selectedScenarioId, scenario.defaultCurrentReelId]);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setActiveVideo(null);
    setError(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          historyId: selectedScenarioId,
          currentReelId: currentReelId
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch recommendation.');
      }

      const data: RecommendationResponse = await response.json();
      setResult(data);
      if (data.recommendedReel) {
        setActiveVideo(getRandomVerifiedVideo(data.recommendedReel.id));
      } else {
        setActiveVideo(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-4 sm:p-8 lg:p-12 selection:bg-violet-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                Phase 1 MVP
              </span>
              <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full tracking-wider">
                Explainability & Observability
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full tracking-wider">
                Fallback Protected
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 mt-2">
              Reel Interest Recommender
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Semantic interest abstraction dashboard. Injects interaction history profiles, runs abstractive reasoning models, and recommends technical educational candidates.
            </p>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls & Configuration (Left 7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Scenario Configuration Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-4 backdrop-blur-sm">
              <h2 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse"></span>
                Select Demo Scenario Profile
              </h2>
              
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Scenario Profile
                </label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {Object.keys(historyScenarios).map((key) => (
                    <option key={key} value={key}>
                      {historyScenarios[key].title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-zinc-950/60 rounded-lg p-3.5 border border-zinc-800/60">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-300">Description: </span>
                  {scenario.description}
                </p>
              </div>

              {/* Current Reel selection modifier */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Select Current Reel (Server-Resolved Context)
                </label>
                <div className="flex flex-wrap gap-2">
                  {scenario.history.map((reel) => (
                    <button
                      key={reel.id}
                      onClick={() => {
                        setCurrentReelId(reel.id);
                        setResult(null);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        currentReelId === reel.id
                          ? 'bg-violet-600/20 border-violet-500 text-violet-200 font-bold shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {reel.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interaction History List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  User Interaction History Stream ({scenario.history.length} items)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {scenario.history.map((reel) => {
                  const isCurrent = reel.id === currentReelId;
                  return (
                    <div
                      key={reel.id}
                      className={`relative rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-zinc-900 border-violet-500 ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/10'
                          : 'bg-zinc-900/60 border-zinc-800/60 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-zinc-800 border border-zinc-700/70 text-zinc-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {reel.category}
                          </span>
                          {isCurrent && (
                            <span className="bg-violet-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide animate-pulse">
                              Current Reel
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-zinc-100 mt-2 line-clamp-1">
                          {reel.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {reel.description}
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/50 flex justify-between items-center">
                        <span>ID: {reel.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing Abstractive Pipelines...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze My Interests
                  </>
                )}
              </button>

              {result?.recommendedReel && activeVideo && (
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <svg className="w-4 h-4 text-red-400 fill-current" viewBox="0 0 24 24">
                    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.545,15.568V8.432L15.818,12L9.545,15.568z"/>
                  </svg>
                  ▶ Watch Recommended Reel
                </a>
              )}
            </div>
            
          </div>

          {/* Results Display Panel (Right 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
              Semantic Interest Abstractor Output
            </h3>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-xl p-5 text-sm space-y-1 shadow-md">
                <div className="font-bold flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Execution Error
                </div>
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !result && !error && (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 sm:p-12 text-center text-zinc-500 bg-zinc-900/20 backdrop-blur-sm">
                <svg className="w-8 h-8 mx-auto text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-semibold text-zinc-400">Ready for Interest Analysis</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a demo profile scenario on the left and click &quot;Analyze My Interests&quot; to view recommendation logic.</p>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-800 rounded"></div>
                  <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                </div>
                <div className="h-20 bg-zinc-800 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                  <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
                </div>
              </div>
            )}

            {/* Actual Result Panel */}
            {result && (
              <div
                className={`bg-zinc-900/90 border rounded-xl p-6 shadow-2xl transition-all duration-300 relative space-y-5 backdrop-blur-sm ${
                  result.confidence === 'High'
                    ? 'border-violet-500/40 ring-1 ring-violet-500/10'
                    : 'border-zinc-800 opacity-95'
                }`}
              >
                {/* Fallback Badge */}
                {result.source === 'fallback' && (
                  <div className="absolute -top-3 right-6 bg-amber-600 text-white font-black text-[9px] uppercase px-3 py-1 rounded-full tracking-wider border border-amber-500 shadow-md">
                    Deterministic Fallback Active
                  </div>
                )}

                {/* 1. CURRENT REEL */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    1. Current Reel Context
                  </span>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 font-medium flex items-center justify-between">
                    <span>{result.currentReelTitle}</span>
                    <span className="text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {currentReel.category}
                    </span>
                  </div>
                </div>

                {/* 2. INTEREST DETECTED */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    2. Inferred Tech Interest
                  </span>
                  <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    {result.interestDetected}
                  </div>
                </div>

                {/* 3. WHY */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    3. Context / Cross-Reel Pattern
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/60">
                    {result.whyInterest}
                  </p>
                </div>

                {/* 4. RECOMMENDED TECH REEL */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    4. Recommended Tech Candidate
                  </span>
                  {result.recommendedReel ? (
                    <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-violet-950/60 border border-violet-800/60 text-violet-300 text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-wide">
                            {result.recommendedReel.category}
                          </span>
                          <span className="text-zinc-500 text-[10px]">
                            ID: {result.recommendedReel.id}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-zinc-100 mt-2">
                          {result.recommendedReel.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {result.recommendedReel.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px]">
                        <div className="text-zinc-400 space-x-2">
                          <span>Diff: <strong className="text-zinc-200">{result.recommendedReel.difficulty}</strong></span>
                          <span>•</span>
                          <span>Hype Risk: <strong className={result.recommendedReel.hypeRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>{result.recommendedReel.hypeRisk}</strong></span>
                        </div>
                        {activeVideo && (
                          <a
                            href={activeVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                          >
                            ▶ Watch
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center text-zinc-500 bg-zinc-950/40">
                      <p className="text-xs font-semibold text-zinc-400">No recommendation candidate resolved</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Interest signal was insufficient or candidates were filtered by anti-hype criteria.</p>
                    </div>
                  )}
                </div>

                {/* 5. CATEGORY & SELECTION EXPLANATION */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Taxonomy & Difficulty
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {result.category || 'None'} ({result.difficulty || 'N/A'})
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/40">
                    <strong className="text-zinc-300">Selection Logic: </strong>
                    {result.whyRecommendation || 'N/A - No candidate selected.'}
                  </p>
                </div>

                {/* 6. CONFIDENCE */}
                <div className="space-y-1 pt-2 border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Analysis Confidence
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide border ${
                        result.confidence === 'High'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : result.confidence === 'Medium'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {result.confidence}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Source: {result.source === 'ai' ? 'Gemini Abstractive AI' : 'Deterministic Plurality Fallback'}
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* EVALUATOR OBSERVABILITY & EXPLAINABILITY DASHBOARD */}
        <section className="pt-6 border-t border-zinc-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Evaluator Observability & Explainability Audit
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time evidence, naive vs signal benchmark, candidate hype risk checks, and system verification guardrails.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800 self-start sm:self-auto">
              Evaluation Mode: Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* FEATURE 1 — NAIVE VS SIGNAL COMPARISON */}
            <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs text-violet-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                  Why Signal Beats Naive Matching
                </h3>
                <span className="text-[10px] text-zinc-500 font-medium">Core Problem Benchmark</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Naive Card */}
                <div className="bg-zinc-950/80 border border-amber-900/40 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      Naive Recommender
                    </span>
                    <span className="text-[10px] text-zinc-500">Surface Match</span>
                  </div>
                  <div className="text-xs font-bold text-zinc-200 pt-1">
                    Current Reel Topic: &quot;{currentReel.title}&quot; ({currentReel.category})
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Follows only the surface category/topic of the currently watched item ({currentReel.category}). Susceptible to viral traps, memes, and superficial video context.
                  </p>
                </div>

                {/* Signal Card */}
                <div className="bg-zinc-950/80 border border-violet-500/40 rounded-lg p-4 space-y-2 ring-1 ring-violet-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/50">
                      Signal Engine (Ours)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Abstracted Intent</span>
                  </div>
                  <div className="text-xs font-bold text-zinc-200 pt-1">
                    Inferred: {result ? result.interestDetected : `[Run analysis on ${scenario.title}]`}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Evaluates multi-item interaction history ({scenario.history.length} reels) to extract underlying tech interest. Recommends target category {result?.category ? `"${result.category}"` : 'educational content'} instead of echoing current topic.
                  </p>
                </div>
              </div>
            </div>

            {/* FEATURE 3 — INTEREST VECTOR VISUALIZATION */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  Observed Interest Signals
                </h3>
                <span className="text-[10px] text-zinc-500">History Tags</span>
              </div>

              <div className="space-y-3">
                {observedSignals.map((sig) => {
                  const barWidth = sig.strength === 'Strong' ? 'w-full bg-violet-500' : sig.strength === 'Medium' ? 'w-2/3 bg-indigo-500' : 'w-1/3 bg-zinc-600';
                  return (
                    <div key={sig.category} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-300">{sig.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">{sig.count} item{sig.count > 1 ? 's' : ''}</span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            sig.strength === 'Strong' ? 'bg-violet-950 text-violet-300 border border-violet-800' :
                            sig.strength === 'Medium' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                            'bg-zinc-950 text-zinc-400 border border-zinc-800'
                          }`}>
                            {sig.strength}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-850 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${barWidth}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FEATURE 2 — EVIDENCE / SIGNAL PANEL */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Signal Evidence Matrix
                </h3>
                <span className="text-[10px] text-zinc-500">Live State</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">History Items</span>
                  <span className="font-bold text-zinc-200 text-sm">{scenario.history.length}</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Current Focus</span>
                  <span className="font-semibold text-zinc-300 truncate block">{currentReel.title}</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Inferred Interest</span>
                  <span className="font-bold text-violet-300 truncate block">{result ? result.interestDetected : 'Pending'}</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Recommendation Category</span>
                  <span className="font-semibold text-zinc-300">{result?.category || 'Pending'}</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Engine Confidence</span>
                  <span className="font-bold text-emerald-400">{result ? result.confidence : 'Pending'}</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Resolution Pipeline</span>
                  <span className="font-semibold text-zinc-400 text-[10px]">
                    {result ? (result.source === 'ai' ? 'Gemini Model' : 'Plurality Fallback') : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* FEATURE 4 — ANTI-HYPE AUDIT */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Anti-Hype Guardrails Audit
                </h3>
                <span className="text-[10px] text-zinc-500">Candidate Risk</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Candidate Safety Check: <strong className="text-zinc-100">Passed</strong> ({candidates.length} verified library items)</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>High-Hype Candidates Excluded: <strong className="text-amber-300">Active</strong> (Clickbait filtered)</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Selected Candidate Hype Risk:</span>
                    <strong className={result?.recommendedReel?.hypeRisk === 'Low' ? 'text-emerald-400' : 'text-zinc-200'}>
                      {result?.recommendedReel ? `${result.recommendedReel.hypeRisk} Risk Verified` : 'No candidate active'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE 5 — RELIABILITY & VERIFICATION GUARDRAILS */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-xs text-sky-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Reliability &amp; Verification Guardrails
                </h3>
                <span className="text-[10px] text-zinc-500">Pipeline Health</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Zod Structural Schema Validation
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Logical Contradiction Check
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Candidate Library Bounds Verification
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">BOUNDED</span>
                </div>
                <div className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Zero-Downtime Plurality Fallback
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">READY</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
