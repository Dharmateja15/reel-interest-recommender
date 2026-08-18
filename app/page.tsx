'use client';

import React, { useState, useEffect } from 'react';
import { historyScenarios, HistoryScenario } from '../data/history-sets';
import { RecommendationResponse, InteractionReel } from '../lib/types';

export default function Home() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('demoTrapHistory');
  const [currentReelId, setCurrentReelId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scenario: HistoryScenario = historyScenarios[selectedScenarioId] || historyScenarios.demoTrapHistory;

  // Initialize currentReelId when scenario changes
  useEffect(() => {
    setCurrentReelId(scenario.defaultCurrentReelId);
    setResult(null);
    setError(null);
  }, [selectedScenarioId, scenario.defaultCurrentReelId]);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider">
              Phase 1 MVP
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 mt-2">
            Reel Interest Recommender
          </h1>
          <p className="text-zinc-400 mt-1 max-w-2xl">
            Semantic interest abstraction dashboard. Injects interaction history profiles, runs abstractive reasoning models, and recommends technical educational candidates.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls & Configuration (Left Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scenario Configuration Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-violet-500 rounded-full"></span>
                Select Demo Scenario Profile
              </h2>
              
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
                  Scenario Profile
                </label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {Object.keys(historyScenarios).map((key) => (
                    <option key={key} value={key}>
                      {historyScenarios[key].title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/40">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-300">Description: </span>
                  {scenario.description}
                </p>
              </div>

              {/* Current Reel selection modifier */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
                  Select Current Reel (Server-Resolved context)
                </label>
                <div className="flex flex-wrap gap-2">
                  {scenario.history.map((reel) => (
                    <button
                      key={reel.id}
                      onClick={() => {
                        setCurrentReelId(reel.id);
                        setResult(null);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
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
              <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                User Interaction History Stream
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenario.history.map((reel) => {
                  const isCurrent = reel.id === currentReelId;
                  return (
                    <div
                      key={reel.id}
                      className={`relative rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-zinc-900 border-violet-500 ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/5'
                          : 'bg-zinc-900/60 border-zinc-800/60 opacity-70 hover:opacity-90'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-zinc-850 border border-zinc-700 text-zinc-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
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
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {reel.description}
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/50 flex justify-between">
                        <span>ID: {reel.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
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
            </div>
            
          </div>

          {/* Results Display Panel (Right Column) */}
          <div className="space-y-6">
            <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
              Semantic Interest Abstractor output
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
              <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500 bg-zinc-900/10">
                <svg className="w-8 h-8 mx-auto text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-semibold text-zinc-400">Ready for Interest Analysis</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Select a demo profile scenario on the left and trigger semantic extraction pipelines.</p>
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
                className={`bg-zinc-900 border rounded-xl p-6 shadow-2xl transition-all duration-300 relative space-y-6 ${
                  result.confidence === 'High'
                    ? 'border-violet-500/40 ring-1 ring-violet-500/10'
                    : 'border-zinc-800 opacity-80' // Visually de-emphasized styling for non-High confidence
                }`}
              >
                {/* Fallback Badge */}
                {result.source === 'fallback' && (
                  <div className="absolute -top-3 right-6 bg-amber-600 text-white font-black text-[9px] uppercase px-3 py-1 rounded-full tracking-wider border border-amber-500 shadow-md">
                    Deterministic Fallback Active
                  </div>
                )}

                {/* RESULT FIELDS ORDERED EXACTLY AS SPECIFIED */}
                
                {/* 1. CURRENT REEL */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    1. Current Reel
                  </span>
                  <div className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-sm text-zinc-200 font-medium">
                    {result.currentReelTitle}
                  </div>
                </div>

                {/* 2. INTEREST DETECTED */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    2. Interest Inferred
                  </span>
                  <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    {result.interestDetected}
                  </div>
                </div>

                {/* 3. WHY */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    3. Context / Why Inferred
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 rounded-lg p-3 border border-zinc-850/50">
                    {result.whyInterest}
                  </p>
                </div>

                {/* 4. RECOMMENDED TECH REEL */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    4. Recommended Technology Reel Candidate
                  </span>
                  {result.recommendedReel ? (
                    <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-violet-950/50 border border-violet-850 text-violet-300 text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-wide">
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
                      <div className="text-[10px] pt-2 border-t border-zinc-900/50 flex justify-between text-zinc-500">
                        <span>Difficulty: {result.recommendedReel.difficulty}</span>
                        <span>Hype Risk: {result.recommendedReel.hypeRisk}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
                      <p className="text-xs font-semibold">No recommendation resolved</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">Interest signal was insufficient or candidates were filtered due to high hype risk.</p>
                    </div>
                  )}
                </div>

                {/* 5. CATEGORY */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    5. Recommendation Category Taxonomy
                  </span>
                  <div className="text-xs font-bold text-zinc-300">
                    {result.category || 'None'}
                  </div>
                </div>

                {/* 6. WHY THIS RECOMMENDATION */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    6. Selection Explanation
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {result.whyRecommendation || 'N/A - No candidate selected.'}
                  </p>
                </div>

                {/* 7. DIFFICULTY */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    7. Candidate Difficulty Level
                  </span>
                  <div className="text-xs font-semibold text-zinc-300">
                    {result.difficulty || 'None'}
                  </div>
                </div>

                {/* 8. CONFIDENCE */}
                <div className="space-y-1 pt-2 border-t border-zinc-850">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    8. Analysis Confidence
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide border ${
                        result.confidence === 'High'
                          ? 'bg-green-950/50 border-green-800 text-green-300'
                          : result.confidence === 'Medium'
                          ? 'bg-yellow-950/50 border-yellow-800 text-yellow-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {result.confidence}
                    </span>
                    
                    {/* Visual indicator highlighting non-High confidence states */}
                    {result.confidence !== 'High' && (
                      <span className="text-[10px] text-zinc-500">
                        (Low signal strength or divergent interaction types)
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
