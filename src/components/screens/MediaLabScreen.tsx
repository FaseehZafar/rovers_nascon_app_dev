import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Video, Upload, Wand2, RefreshCw, Download, Play, CheckCircle } from 'lucide-react';
import { useLeague } from '../../context/LeagueContext';
import { HalftoneOverlay } from '../common/HalftoneOverlay';
import { Header } from '../common/Header';
import { BigActionButton } from '../common/BigActionButton';

export const MediaLabScreen: React.FC = () => {
  const { tenant, playHapticFeedback } = useLeague();

  const [activeTab, setActiveTab] = useState<'create-image' | 'edit-image' | 'animate-video'>('create-image');

  // Generation state
  const [prompt, setPrompt] = useState('Dynamic stadium banner celebrating Silver Raiders championship with electric lime accents');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Uploaded photo state for editing / animation
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePrompts = [
    'Futuristic electric lime athletic crest with metallic silver shield and bold typography',
    'Championship match victory celebration with confetti under stadium floodlights in 4K',
    'High-energy running back diving into end zone in slow motion with dramatic dust',
    'Official vintage sports collectible card of Hunter Renfrow in modern high-contrast style',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    playHapticFeedback();
  };

  // 1. Text to Image with gemini-nano-banana-2.1
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setLoadingStep('Crafting visual prompt with gemini-nano-banana-2.1...');
    setErrorMessage(null);
    setGeneratedImageUrl(null);
    playHapticFeedback();

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          model: 'gemini-nano-banana-2.1',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
      setLoadingStep('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Generation encountered an error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Edit Image with gemini-nano-banana-2.1
  const handleEditImage = async () => {
    if (!uploadedImageBase64 || !prompt.trim()) return;
    setIsLoading(true);
    setLoadingStep('Applying neural edits with gemini-nano-banana-2.1...');
    setErrorMessage(null);
    setGeneratedImageUrl(null);
    playHapticFeedback();

    try {
      const res = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          base64Image: uploadedImageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Image editing failed. Please verify the prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Animate Photo into Video with veo-3.1-fast-generate-preview
  const handleAnimateVideo = async () => {
    setIsLoading(true);
    setLoadingStep('Starting Veo video generation (veo-3.1-fast-generate-preview)...');
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    playHapticFeedback();

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          base64Image: uploadedImageBase64 || generatedImageUrl || undefined,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.operationName) {
        throw new Error(data.error || 'Failed to initialize video generation');
      }

      const operationName = data.operationName;
      setLoadingStep('Synthesizing high-frame-rate motion and athletic physics...');

      // Poll video status
      let isDone = false;
      let attempts = 0;
      while (!isDone && attempts < 25) {
        await new Promise((r) => setTimeout(r, 4000));
        attempts++;
        setLoadingStep(`Rendering video frames... (${attempts * 4}s elapsed)`);

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const pollData = await pollRes.json();

        if (pollData.error) {
          throw new Error(pollData.error.message || 'Video generation error from model');
        }

        if (pollData.done) {
          isDone = true;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }

      setLoadingStep('Downloading and preparing stream...');
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to download completed video stream');
      }

      const videoBlob = await downloadRes.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoObjectUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Video generation could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-24 bg-neutral-900 text-white select-none">
      {/* Top Header */}
      <div
        style={{ backgroundColor: tenant.colors.primary }}
        className="relative pt-2 pb-6 px-4 rounded-b-[36px] shadow-sm text-black overflow-hidden"
      >
        <HalftoneOverlay variant="lime" opacity={0.35} />
        <Header variant="lime" title="AI CREATIVE STUDIO" />

        <div className="relative z-10 mt-3 px-1">
          <div className="font-condensed text-5xl font-black uppercase leading-none">
            MEDIA LAB
          </div>
          <div className="text-xs uppercase font-bold text-black/70 mt-1">
            POWERED BY GEMINI NANO BANANA 2.1 & VEO VIDEO ENGINE
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('create-image')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-condensed text-base uppercase whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'create-image'
                ? 'bg-[#0E0E12] text-white font-black'
                : 'bg-black/15 text-black hover:bg-black/25'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#C8F135]" />
            <span>CREATE IMAGE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit-image')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-condensed text-base uppercase whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'edit-image'
                ? 'bg-[#0E0E12] text-white font-black'
                : 'bg-black/15 text-black hover:bg-black/25'
            }`}
          >
            <Wand2 className="w-4 h-4 text-[#C8F135]" />
            <span>EDIT PHOTO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('animate-video')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-condensed text-base uppercase whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'animate-video'
                ? 'bg-[#0E0E12] text-white font-black'
                : 'bg-black/15 text-black hover:bg-black/25'
            }`}
          >
            <Video className="w-4 h-4 text-[#7B6CF2]" />
            <span>ANIMATE TO VEO VIDEO</span>
          </button>
        </div>
      </div>

      {/* Main Studio Console */}
      <div className="px-4 mt-6 space-y-4">
        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/50 text-rose-200 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Upload Box for Edit & Video modes */}
        {(activeTab === 'edit-image' || activeTab === 'animate-video') && (
          <div className="p-4 rounded-3xl bg-neutral-800/80 border border-white/10 text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
              SOURCE ATHLETE / CLUB PHOTO
            </span>

            {uploadedImageBase64 ? (
              <div className="relative inline-block mx-auto rounded-2xl overflow-hidden border border-white/20 max-h-48">
                <img
                  src={uploadedImageBase64}
                  alt="Uploaded preview"
                  className="max-h-48 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setUploadedImageBase64(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/80 text-white text-[10px] font-bold uppercase cursor-pointer"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#C8F135] rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center transition-colors"
              >
                <Upload className="w-8 h-8 text-[#C8F135] mb-2" />
                <span className="font-condensed text-lg uppercase font-bold text-white">
                  UPLOAD CLUB OR PLAYER PHOTO
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Supports PNG, JPG, WebP
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Prompt Input */}
        <div className="p-4 rounded-3xl bg-neutral-800/80 border border-white/10 space-y-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block">
            {activeTab === 'create-image'
              ? 'TEXT PROMPT (GEMINI-NANO-BANANA-2.1)'
              : activeTab === 'edit-image'
              ? 'EDIT INSTRUCTIONS (e.g. "Add electric lightning aura")'
              : 'MOTION & CINEMATIC ACTION PROMPT (VEO FAST PREVIEW)'}
          </label>

          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the sports artwork or motion in detail..."
            className="w-full p-3 rounded-2xl bg-neutral-900 border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#C8F135]"
          />

          {/* Quick presets */}
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1.5">
              PRESET INSPIRATIONS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 text-[11px] truncate max-w-xs cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector (Mandatory 16:9 or 9:16 for Veo) */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              ASPECT RATIO:
            </span>
            <div className="flex items-center gap-1.5">
              {activeTab !== 'animate-video' && (
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-3 py-1 rounded-lg font-condensed text-xs uppercase font-bold cursor-pointer ${
                    aspectRatio === '1:1' ? 'bg-[#C8F135] text-black font-black' : 'bg-white/10 text-white'
                  }`}
                >
                  1:1 SQUARE
                </button>
              )}
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-3 py-1 rounded-lg font-condensed text-xs uppercase font-bold cursor-pointer ${
                  aspectRatio === '16:9' ? 'bg-[#C8F135] text-black font-black' : 'bg-white/10 text-white'
                }`}
              >
                16:9 LANDSCAPE
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-3 py-1 rounded-lg font-condensed text-xs uppercase font-bold cursor-pointer ${
                  aspectRatio === '9:16' ? 'bg-[#C8F135] text-black font-black' : 'bg-white/10 text-white'
                }`}
              >
                9:16 PORTRAIT
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {activeTab === 'create-image' && (
            <BigActionButton
              label={isLoading ? 'GENERATING IMAGE...' : 'GENERATE WITH NANO BANANA 2.1'}
              variant="lime"
              disabled={isLoading}
              onClick={handleGenerateImage}
            />
          )}

          {activeTab === 'edit-image' && (
            <BigActionButton
              label={isLoading ? 'EDITING IMAGE...' : 'APPLY NEURAL EDITS'}
              variant="lime"
              disabled={isLoading || !uploadedImageBase64}
              onClick={handleEditImage}
            />
          )}

          {activeTab === 'animate-video' && (
            <BigActionButton
              label={isLoading ? 'RENDERING VEO VIDEO...' : 'GENERATE VEO VIDEO (VEO-3.1-FAST)'}
              variant="violet"
              disabled={isLoading}
              onClick={handleAnimateVideo}
            />
          )}
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-6 rounded-3xl bg-neutral-800/90 border border-white/10 text-center animate-pulse">
            <RefreshCw className="w-8 h-8 text-[#C8F135] animate-spin mx-auto mb-2" />
            <div className="font-condensed text-xl uppercase font-bold text-white">
              SYNTHESIZING MEDIA
            </div>
            <p className="text-xs text-neutral-400 mt-1">{loadingStep}</p>
          </div>
        )}

        {/* Generated Image Result */}
        {generatedImageUrl && (
          <div className="p-4 rounded-3xl bg-white text-[#0E0E12] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-condensed text-2xl font-black uppercase text-[#0E0E12]">
                GENERATED ARTWORK
              </span>
              <a
                href={generatedImageUrl}
                download="league-artwork.png"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-black text-[#C8F135] font-condensed text-xs font-bold uppercase cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </a>
            </div>

            <img
              src={generatedImageUrl}
              alt="Generated visual"
              className="w-full rounded-2xl shadow-sm object-cover max-h-96"
            />
          </div>
        )}

        {/* Generated Video Result */}
        {generatedVideoUrl && (
          <div className="p-4 rounded-3xl bg-white text-[#0E0E12] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-condensed text-2xl font-black uppercase text-[#0E0E12]">
                VEO VIDEO ANIMATION
              </span>
              <a
                href={generatedVideoUrl}
                download="veo-sports-clip.mp4"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#7B6CF2] text-white font-condensed text-xs font-bold uppercase cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD MP4</span>
              </a>
            </div>

            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-2xl shadow-sm max-h-96 bg-black"
            />
          </div>
        )}
      </div>
    </div>
  );
};
