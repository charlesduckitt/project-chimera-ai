import React, { useState } from "react";
import { RaceType, RaceClass, QualitativeAnalysis } from "../types";
import { MAX_ODDS, MIN_RUNNERS } from "../constants";
import { analyzeRaceQualitative } from "../services/geminiService";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  BrainCircuit,
  Loader2,
} from "lucide-react";

interface AnalyzerProps {
  onBetAuthorized: (
    horse: string,
    course: string,
    odds: number,
    analysis: string
  ) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ onBetAuthorized }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [course, setCourse] = useState("");
  const [raceType, setRaceType] = useState<RaceType>(RaceType.HANDICAP);
  const [raceClass, setRaceClass] = useState<number>(5);
  const [runners, setRunners] = useState<number>(8);
  const [horseName, setHorseName] = useState("");
  const [bsp, setBsp] = useState<number>(2.5);
  const [trainerJockey, setTrainerJockey] = useState("");
  const [conditions, setConditions] = useState("");
  const [context, setContext] = useState("");

  // Analysis Result
  const [analysis, setAnalysis] = useState<QualitativeAnalysis | null>(null);

  const checkQuantitative = () => {
    // Section 3.0 Logic
    if (raceType !== RaceType.HANDICAP)
      return "Only Handicap races are permitted (Rule 3.2.1)";
    if (raceClass < 5)
      return "Only Class 5 & 6 races are permitted (Rule 3.2.2)";
    if (bsp > MAX_ODDS)
      return `Odds (${bsp}) exceed maximum limit of ${MAX_ODDS} (Rule 3.3.1)`;
    if (runners < MIN_RUNNERS)
      return `Field size (${runners}) is below minimum of ${MIN_RUNNERS} (Rule 3.3.2)`;
    return null;
  };

  const handleQuantitativeCheck = () => {
    const error = checkQuantitative();
    if (error) {
      alert(`REJECTED: ${error}`);
      return;
    }
    setStep(2);
  };

  const handleAIAnalysis = async () => {
    if (!process.env.API_KEY) {
      alert("API_KEY missing. Cannot perform AI analysis.");
      return;
    }
    setLoading(true);
    const result = await analyzeRaceQualitative(
      context,
      horseName,
      trainerJockey,
      conditions
    );
    setAnalysis(result);
    setLoading(false);
    setStep(3);
  };

  const handleAuthorize = () => {
    if (analysis?.isApproved) {
      onBetAuthorized(horseName, course, bsp, analysis.reasoning);
      // Reset logic could go here
    }
  };

  return (
    <div className="bg-chimera-800 border border-chimera-700 rounded-lg p-6 shadow-xl">
      <div className="flex items-center mb-6">
        <BrainCircuit className="w-6 h-6 text-chimera-accent mr-2" />
        <h2 className="text-xl font-semibold text-white">
          Algorithmic Selection Engine
        </h2>
      </div>

      {/* Step 1: Quantitative Filters */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Race Course
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white focus:border-chimera-accent outline-none"
                placeholder="e.g. Wolverhampton"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Horse Name (Favourite)
              </label>
              <input
                type="text"
                value={horseName}
                onChange={(e) => setHorseName(e.target.value)}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white focus:border-chimera-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Race Type
              </label>
              <select
                value={raceType}
                onChange={(e) => setRaceType(e.target.value as RaceType)}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
              >
                <option value={RaceType.HANDICAP}>Handicap</option>
                <option value={RaceType.NON_HANDICAP}>Non-Handicap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Race Class (1-7)
              </label>
              <input
                type="number"
                value={raceClass}
                onChange={(e) => setRaceClass(Number(e.target.value))}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
                min="1"
                max="7"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Runners
              </label>
              <input
                type="number"
                value={runners}
                onChange={(e) => setRunners(Number(e.target.value))}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Betfair SP (Max 3.00)
              </label>
              <input
                type="number"
                step="0.01"
                value={bsp}
                onChange={(e) => setBsp(Number(e.target.value))}
                className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleQuantitativeCheck}
            className="w-full bg-chimera-700 hover:bg-chimera-600 text-white font-mono py-3 rounded transition-colors mt-4 border border-gray-600"
          >
            RUN QUANTITATIVE FILTER &gt;
          </button>
        </div>
      )}

      {/* Step 2: Qualitative Context */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-green-900/20 border border-green-500/30 p-3 rounded mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-400 text-sm">
              Quantitative Filters Passed. Proceeding to AI Analysis.
            </span>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Trainer & Jockey
            </label>
            <input
              type="text"
              value={trainerJockey}
              onChange={(e) => setTrainerJockey(e.target.value)}
              className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
              placeholder="e.g., Jonjo O'Neill / A. Coleman"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Race Conditions
            </label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none"
              placeholder="e.g., Heavy Ground, 2 Miles"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Form Analysis / Context (Paste details)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="w-full bg-chimera-900 border border-chimera-700 rounded p-2 text-white outline-none text-sm"
              placeholder="Paste form strings, recent comments, or detailed analysis here..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-transparent border border-gray-600 text-gray-400 hover:text-white py-3 rounded transition-colors"
            >
              BACK
            </button>
            <button
              onClick={handleAIAnalysis}
              disabled={loading}
              className="flex-1 bg-chimera-accent hover:bg-cyan-600 text-black font-bold font-mono py-3 rounded transition-colors flex justify-center items-center"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <BrainCircuit className="mr-2 w-5 h-5" />
              )}
              {loading ? "ANALYZING..." : "INITIATE AI ADJUDICATOR"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && analysis && (
        <div className="space-y-4 animate-fade-in">
          <div
            className={`p-4 rounded border ${
              analysis.isApproved
                ? "bg-green-900/20 border-green-500"
                : "bg-red-900/20 border-red-500"
            }`}
          >
            <div className="flex items-center mb-2">
              {analysis.isApproved ? (
                <CheckCircle className="text-green-500 mr-2" />
              ) : (
                <XCircle className="text-red-500 mr-2" />
              )}
              <h3
                className={`font-bold text-lg ${
                  analysis.isApproved ? "text-green-400" : "text-red-400"
                }`}
              >
                {analysis.isApproved ? "LAY BET AUTHORIZED" : "BET REJECTED"}
              </h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">{analysis.reasoning}</p>

            {analysis.riskFactors.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Risk Factors Identified:
                </span>
                <ul className="list-disc list-inside text-xs text-gray-400 mt-1">
                  {analysis.riskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 text-xs font-mono text-gray-500">
              AI Confidence Score: {analysis.confidenceScore}/100
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-transparent border border-gray-600 text-gray-400 hover:text-white py-3 rounded"
            >
              RE-ANALYZE
            </button>
            {analysis.isApproved && (
              <button
                onClick={handleAuthorize}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold font-mono py-3 rounded shadow-lg shadow-green-900/50"
              >
                PROCEED TO EXECUTION
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
