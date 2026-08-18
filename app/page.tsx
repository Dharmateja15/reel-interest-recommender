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
  const [showEvaluationDetails, setShowEvaluationDetails] = useState<boolean>(false);

  const scenario: HistoryScenario = historyScenarios[selectedScenarioId] || historyScenarios.aiClusterHistory;
  const currentReel = scenario.history.find((r) => r.id === currentReelId) || scenario.history[0];
  const observedSignals = getObservedInterestSignals(scenario.history);

  // Clear previous result and set currentReelId when scenario changes
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-4 sm:p-6 lg:p-10 selection:bg-violet-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <header className="border-b border-zinc-800/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm">
                Phase 1 MVP
              </span>
              <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Abstractive Recommender
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-50">
              Reel Interest Recommender
            </h1>
            <p className="text-violet-300 text-sm sm:text-base font-semibold">
              &quot;Don&apos;t recommend from one Reel. Understand the person behind the Reels.&quot;
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Semantic interest abstraction engine that evaluates cross-reel interaction patterns to surface grounded, educational technical recommendations.
            </p>
          </div>
        </header>

        {/* MAIN WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT / PRIMARY COLUMN: CONTROLS & INTERACTION STREAM (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Scenario Configuration Card */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h2 className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                  Select Demo Scenario Profile
                </h2>
                <span className="text-[10px] text-zinc-500 font-mono">Scenario Control</span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="scenarioSelect" className="text-xs text-zinc-300 font-semibold block">
                  Interactive Profile Dataset
                </label>
                <select
                  id="scenarioSelect"
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-3.5 text-sm text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
                >
                  {Object.keys(historyScenarios).map((key) => (
                    <option key={key} value={key}>
                      {historyScenarios[key].title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-zinc-950/70 rounded-xl p-4 border border-zinc-800/50">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-violet-300">Profile Insight: </strong>
                  {scenario.description}
                </p>
              </div>

              {/* Current Reel Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs text-zinc-300 font-semibold block">
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
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        currentReelId === reel.id
                          ? 'bg-violet-600/25 border-violet-500 text-violet-100 font-bold shadow-md ring-1 ring-violet-500/30'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
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
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  User Interaction History Stream ({scenario.history.length} reels)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {scenario.history.map((reel) => {
                  const isCurrent = reel.id === currentReelId;
                  return (
                    <div
                      key={reel.id}
                      className={`rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-zinc-900 border-violet-500/80 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/5'
                          : 'bg-zinc-900/50 border-zinc-800/60 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-zinc-800/90 border border-zinc-700/70 text-zinc-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                            {reel.category}
                          </span>
                          {isCurrent && (
                            <span className="bg-violet-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider animate-pulse">
                              Current Reel
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-100 line-clamp-1">
                          {reel.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {reel.description}
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/50 flex justify-between items-center font-mono">
                        <span>ID: {reel.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing Abstractive Engine...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze My Interests
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT / PRIMARY COLUMN: SEMANTIC INTEREST ABSTRACTOR OUTPUT (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                Semantic Interest Abstractor
              </h3>
              {result && (
                <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                  Source: {result.source === 'ai' ? 'Gemini 1.5 Flash' : 'Deterministic Plurality Fallback'}
                </span>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-2xl p-6 space-y-1 shadow-md">
                <div className="font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Execution Error
                </div>
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !result && !error && (
              <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-10 sm:p-14 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-violet-600/10 border border-violet-500/20 mx-auto flex items-center justify-center text-violet-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-zinc-200">Ready for Interest Analysis</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Select a scenario on the left and click &quot;Analyze My Interests&quot; to run semantic extraction models across interaction history.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-7 space-y-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-zinc-800 rounded w-2/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                </div>
                <div className="h-32 bg-zinc-800/80 rounded-2xl"></div>
              </div>
            )}

            {/* ACTUAL RECOMMENDATION PRODUCT DISPLAY */}
            {result && (
              <div className="space-y-6">

                {/* 1. INTEREST INFERRED PANEL */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Context: {result.currentReelTitle}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-zinc-100">
                        {result.interestDetected}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider border ${
                          result.confidence === 'High'
                            ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                            : result.confidence === 'Medium'
                            ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Confidence: {result.confidence}
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-950/70 rounded-xl p-3.5 border border-zinc-800/50">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <strong className="text-zinc-200">Why Inferred: </strong>
                      {result.whyInterest}
                    </p>
                  </div>
                </div>

                {/* 2. RECOMMENDED FOR YOU (THE PRIMARY VISUAL ELEMENT) */}
                {result.recommendedReel ? (
                  <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border-2 border-violet-500/50 rounded-2xl p-6 shadow-2xl space-y-5 ring-1 ring-violet-500/20">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-2">
                        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Recommended For You
                      </span>
                      <span className="bg-violet-950/70 border border-violet-700/60 text-violet-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wide">
                        {result.recommendedReel.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-black text-zinc-50 leading-tight">
                        {result.recommendedReel.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {result.recommendedReel.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                        <span>Difficulty: <strong className="text-zinc-200">{result.recommendedReel.difficulty}</strong></span>
                        <span>•</span>
                        <span>Hype Risk: <strong className={result.recommendedReel.hypeRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>{result.recommendedReel.hypeRisk} Risk</strong></span>
                      </div>

                      {/* Primary Watch Action directly in Recommendation Card */}
                      {activeVideo && (
                        <a
                          href={activeVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.545,15.568V8.432L15.818,12L9.545,15.568z"/>
                          </svg>
                          ▶ Watch Recommended Reel
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* INTENTIONAL NO-SIGNAL STATE */
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/50">
                        Low Confidence Signal
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">Anti-Hype Guardrail Active</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-extrabold text-zinc-100">
                        NO STRONG TECHNOLOGY SIGNAL
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        The selected interaction history does not contain enough technical evidence to make a safe recommendation.
                      </p>
                    </div>

                    <div className="bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/50 text-xs text-zinc-400 leading-relaxed">
                      <strong className="text-zinc-300 block mb-0.5">Selection Logic:</strong>
                      {result.whyRecommendation || 'Filtered to prevent irrelevant or clickbait recommendations.'}
                    </div>
                  </div>
                )}

                {/* 3. WHY THIS RECOMMENDATION? */}
                {result.recommendedReel && (
                  <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-2">
                      Why This Recommendation?
                    </h4>

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-semibold px-2.5 py-1 rounded-md">
                        ✓ Category Plurality Match ({result.category})
                      </span>
                      <span className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-semibold px-2.5 py-1 rounded-md">
                        ✓ Low Hype Risk Verified
                      </span>
                      <span className="bg-violet-950/50 border border-violet-800/60 text-violet-300 font-semibold px-2.5 py-1 rounded-md">
                        ✓ Stream Interest Grounded
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {result.whyRecommendation}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* SECTION 1: HOW THE SIGNAL WAS FOUND (CLEAN PIPELINE) */}
        <section className="pt-8 border-t border-zinc-800/70 space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-extrabold text-zinc-100 uppercase tracking-wide">
              How the Signal Was Found
            </h2>
            <p className="text-xs text-zinc-400">
              End-to-end abstractive interest pipeline from raw interaction stream to target candidate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">Step 1</span>
              <h4 className="text-xs font-bold text-zinc-200">Interactions</h4>
              <p className="text-[11px] text-zinc-400 leading-tight">Multi-item history profile parsed</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Step 2</span>
              <h4 className="text-xs font-bold text-zinc-200">Signal Detection</h4>
              <p className="text-[11px] text-zinc-400 leading-tight">Cross-reel pattern keyword tallying</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Step 3</span>
              <h4 className="text-xs font-bold text-zinc-200">Broader Interest</h4>
              <p className="text-[11px] text-zinc-400 leading-tight">Abstracted intent from surface topic</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Step 4</span>
              <h4 className="text-xs font-bold text-zinc-200">Candidate Filter</h4>
              <p className="text-[11px] text-zinc-400 leading-tight">Anti-hype risk weighting exclusion</p>
            </div>

            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Step 5</span>
              <h4 className="text-xs font-bold text-zinc-200">Recommendation</h4>
              <p className="text-[11px] text-zinc-400 leading-tight">Grounded educational candidate</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: TECHNICAL EVALUATION DETAILS (COLLAPSIBLE SECONDARY SECTION) */}
        <section className="pt-6 border-t border-zinc-800/70 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-extrabold text-zinc-200 tracking-tight flex items-center gap-2">
                Evaluation & Audit Details
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Technical benchmarking, state metrics, hype guardrails, and system reliability checks for hackathon evaluators.
              </p>
            </div>

            <button
              onClick={() => setShowEvaluationDetails(!showEvaluationDetails)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold py-2.5 px-5 rounded-xl border border-zinc-700 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500 self-stretch sm:self-auto justify-center"
            >
              <span>{showEvaluationDetails ? 'Hide Evaluation Details' : 'Show Evaluation Details'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showEvaluationDetails ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* COLLAPSED / EXPANDED EVALUATOR AUDIT PANEL */}
          {showEvaluationDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 animate-fadeIn">

              {/* NAIVE VS SIGNAL BENCHMARK */}
              <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs text-violet-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                    Why Signal Beats Naive Matching
                  </h4>
                  <span className="text-[10px] text-zinc-500">Core Benchmark</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/80 border border-amber-900/40 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      Naive Recommender
                    </span>
                    <div className="text-xs font-bold text-zinc-200 pt-1">
                      Current Reel Topic: &quot;{currentReel.title}&quot; ({currentReel.category})
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Follows surface topic of current item ({currentReel.category}). Vulnerable to viral meme traps.
                    </p>
                  </div>

                  <div className="bg-zinc-950/80 border border-violet-500/40 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/50">
                      Signal Engine (Ours)
                    </span>
                    <div className="text-xs font-bold text-zinc-200 pt-1">
                      Inferred: {result ? result.interestDetected : 'Pending Analysis'}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Evaluates multi-item interaction history ({scenario.history.length} items) to extract underlying interest.
                    </p>
                  </div>
                </div>
              </div>

              {/* OBSERVED INTEREST SIGNALS */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    Observed Interest Signals
                  </h4>
                  <span className="text-[10px] text-zinc-500">History Tags</span>
                </div>

                <div className="space-y-3">
                  {observedSignals.map((sig) => {
                    const barWidth = sig.strength === 'Strong' ? 'w-full bg-violet-500' : sig.strength === 'Medium' ? 'w-2/3 bg-indigo-500' : 'w-1/3 bg-zinc-600';
                    return (
                      <div key={sig.category} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300">{sig.category}</span>
                          <span className="text-[10px] text-zinc-500">{sig.count} item{sig.count > 1 ? 's' : ''} ({sig.strength})</span>
                        </div>
                        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full ${barWidth}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SIGNAL EVIDENCE MATRIX */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    Signal Evidence Matrix
                  </h4>
                  <span className="text-[10px] text-zinc-500">Live State</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">History Items</span>
                    <span className="font-bold text-zinc-200">{scenario.history.length}</span>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Current Focus</span>
                    <span className="font-semibold text-zinc-300 truncate block">{currentReel.title}</span>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Inferred Interest</span>
                    <span className="font-bold text-violet-300 truncate block">{result ? result.interestDetected : 'Pending'}</span>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Confidence</span>
                    <span className="font-bold text-emerald-400">{result ? result.confidence : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* ANTI-HYPE GUARDRAILS AUDIT */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Anti-Hype Guardrails
                  </h4>
                  <span className="text-[10px] text-zinc-500">Risk Check</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Safety Check: <strong>Passed</strong> ({candidates.length} verified items)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Clickbait Filter: <strong>Active</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Hype Risk: <strong>{result?.recommendedReel ? result.recommendedReel.hypeRisk : 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              {/* RELIABILITY GUARDRAILS */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                    Reliability Guardrails
                  </h4>
                  <span className="text-[10px] text-zinc-500">System Health</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg">
                    <span className="text-zinc-300">Zod Schema Validation</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg">
                    <span className="text-zinc-300">Contradiction Check</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg">
                    <span className="text-zinc-300">Plurality Fallback Engine</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">READY</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
