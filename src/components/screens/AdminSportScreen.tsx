import React, { useState } from 'react';
import { Shield, Code, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { BigActionButton } from '../common/BigActionButton';
import { SportConfig } from '../../types/league';

export const AdminSportScreen: React.FC = () => {
  const { tenant, sport, sports, updateSportConfig, resetDatabase, playHapticFeedback } = useLeague();

  const [jsonText, setJsonText] = useState(() => JSON.stringify(sport, null, 2));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSportId, setSelectedSportId] = useState(sport.id);

  const handleSelectSportToEdit = (sId: string) => {
    setSelectedSportId(sId);
    const target = sports.find((s) => s.id === sId) || sport;
    setJsonText(JSON.stringify(target, null, 2));
    setValidationError(null);
    setSuccessMessage(null);
    playHapticFeedback();
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.id || !parsed.name || !parsed.scoringEvents) {
        throw new Error('Missing required schema fields: id, name, and scoringEvents array are mandatory.');
      }
      if (!Array.isArray(parsed.scoringEvents)) {
        throw new Error('scoringEvents must be an array of scoring rules.');
      }

      updateSportConfig(parsed as SportConfig);
      setValidationError(null);
      setSuccessMessage(`Successfully updated sport engine configuration for "${parsed.name}".`);
      playHapticFeedback();
    } catch (err: any) {
      setValidationError(err.message || 'Invalid JSON format');
      setSuccessMessage(null);
    }
  };

  const handleLoadMysterySportTemplate = () => {
    const mysterySport: SportConfig = {
      id: 'sport-cyber-dodgeball',
      name: 'Cyber Dodgeball',
      displayName: 'Neon Arena Clash',
      category: 'team-ball',
      periodLabel: 'Round',
      totalPeriods: 5,
      periodDurationMinutes: 8,
      scoreLayout: 'rounds',
      primaryStatLabel: 'Eliminations',
      secondaryStatLabel: 'Catches',
      scoringEvents: [
        { id: 'knockout', label: 'Rival Knockout', points: 2, badgeColor: '#C8F135' },
        { id: 'clutch_catch', label: 'Clutch Catch (Revive)', points: 3, badgeColor: '#7B6CF2' },
        { id: 'fault', label: 'Line Fault', points: 0, badgeColor: '#F0503C', isNegative: true },
      ],
    };
    setJsonText(JSON.stringify(mysterySport, null, 2));
    setValidationError(null);
    setSuccessMessage('Loaded mystery sport schema template (zero code branching test).');
    playHapticFeedback();
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-900 text-white select-none">
      {/* Lime Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="SUPER-ADMIN SPORT ENGINE" />

        <div className="relative z-10 mt-3 px-1">
          <div className="font-condensed text-5xl font-black uppercase leading-none">
            SPORT CONFIG JSON
          </div>
          <div className="text-xs uppercase font-bold text-black/70 mt-1">
            DATA-DRIVEN RULES WITH ZERO CODE BRANCHING
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Sport Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sports.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSportToEdit(s.id)}
              className={`px-3 py-1.5 rounded-full font-condensed text-sm uppercase whitespace-nowrap cursor-pointer transition-colors ${
                selectedSportId === s.id
                  ? 'bg-[#C8F135] text-black font-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLoadMysterySportTemplate}
            className="px-3 py-1.5 rounded-full font-condensed text-sm uppercase whitespace-nowrap bg-[#7B6CF2] text-white font-bold cursor-pointer hover:bg-purple-600"
          >
            + LOAD MYSTERY SPORT
          </button>
        </div>

        {/* Status Messages */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* JSON Code Editor */}
        <div className="p-4 rounded-3xl bg-neutral-950 border border-white/10">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#C8F135]" />
              <span className="font-mono text-xs uppercase text-neutral-400 font-bold">
                SPORT_SCHEMA.JSON
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">LIVE VALIDATION</span>
          </div>

          <textarea
            rows={14}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-[#C8F135] leading-relaxed focus:outline-none resize-y selection:bg-[#7B6CF2]"
          />
        </div>

        <BigActionButton
          label="VALIDATE & SAVE SPORT RULES"
          variant="lime"
          onClick={handleApplyJson}
        />

        {/* Database Reset Section */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="font-condensed text-lg uppercase font-bold text-white">
              SYSTEM SEED RESTORATION
            </div>
            <div className="text-xs text-neutral-400 font-medium">
              Restore initial fixtures, squads and scores cleanly
            </div>
          </div>

          <button
            type="button"
            onClick={resetDatabase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-900/50 text-rose-300 font-condensed text-sm font-bold uppercase transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TO SEED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
