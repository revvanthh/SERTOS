import React, { useEffect, useState } from 'react';
import {
  Camera,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Video,
  X,
} from 'lucide-react';
import { useSertos } from '../../context/SertosContext';
import { formatIstTime } from '../../utils/time';

export const LiveCctvPanel: React.FC = () => {
  const { cameras, settings, addToast } = useSertos();
  const [selectedId, setSelectedId] = useState<string>(settings.defaultCctvId || cameras[0].id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [frameTick, setFrameTick] = useState(0);
  const [feedTime, setFeedTime] = useState(() => formatIstTime());

  const activeCamera = cameras.find((c) => c.id === selectedId) || cameras[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setFeedTime(formatIstTime());
      setFrameTick((t) => (t + 1) % 100);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const handleSwitchCamera = () => {
    const idx = cameras.findIndex((c) => c.id === activeCamera.id);
    const next = cameras[(idx + 1) % cameras.length];
    setSelectedId(next.id);
  };

  const handleRefresh = () => {
    setFeedTime(formatIstTime());
    setFrameTick(0);
    addToast({
      type: 'info',
      title: `Camera ${activeCamera.cameraId} Refreshed`,
      description: `Demo frame synced for ${activeCamera.location}.`,
    });
  };

  const renderFeedViewport = (isModal: boolean) => (
    <div
      className={`relative overflow-hidden rounded-lg bg-[#061326] border border-[#1D3552] ${
        isModal ? 'h-[65vh]' : 'h-[152px]'
      }`}
    >
      <img
        src={activeCamera.imageUrl}
        alt={`Demo traffic camera view at ${activeCamera.location}`}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-transform duration-1000 ${
          isPlaying ? 'scale-[1.015]' : 'scale-100 brightness-75'
        }`}
      />
      {/* Subtle dark gradient scrim for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020B18]/85 via-transparent to-[#020B18]/45" />

      {/* Subtle simulated CCTV scan line when playing */}
      {isPlaying && (
        <div
          className="cctv-scanline pointer-events-none absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-[#20E39A]/10 to-transparent"
          aria-hidden="true"
        />
      )}

      {/* Top overlay */}
      <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 bg-[#020B18]/75 border border-[#1D3552] px-2 py-0.5 rounded backdrop-blur-xs">
          <span className="font-mono-tabular font-semibold text-[#F1F5F9]">
            {activeCamera.cameraId}
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="text-[#CBD5E1] truncate max-w-[130px]">{activeCamera.location}</span>
        </div>

        <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/90 text-[#020B18] font-bold tracking-wide">
          DEMO FEED
        </span>
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 text-[10px] font-mono-tabular">
        <span className="text-[#CBD5E1] bg-[#020B18]/75 px-2 py-0.5 rounded">
          {feedTime} IST · {isPlaying ? `${activeCamera.fps} FPS` : 'PAUSED'} · #{frameTick}
        </span>
        <span className="text-[#20E39A] bg-[#020B18]/75 px-2 py-0.5 rounded">
          {activeCamera.resolution}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-4 h-4 text-[#CBD5E1] shrink-0" />
            <h2 className="text-[15px] font-semibold text-[#F1F5F9] truncate">
              Live CCTV Feed
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={activeCamera.id}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Select CCTV camera location"
              className="bg-[#061326] border border-[#1D3552] rounded-md px-2 py-1 text-[11px] text-[#CBD5E1] focus:outline-none focus:border-[#24A8FF]"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.location}
                </option>
              ))}
            </select>
            <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-bold">
              DEMO
            </span>
          </div>
        </div>

        {renderFeedViewport(false)}

        {/* Camera Controls */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] font-medium text-[#F1F5F9] transition-colors"
              aria-label={isPlaying ? 'Pause CCTV demo feed' : 'Play CCTV demo feed'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] font-medium text-[#CBD5E1] hover:text-white transition-colors"
              title="Switch to next camera"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Switch</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[#CBD5E1] hover:text-white transition-colors"
              aria-label="Refresh CCTV feed"
              title="Refresh camera stream"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] font-medium text-[#CBD5E1] hover:text-white transition-colors"
            aria-label="Expand CCTV feed"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>
        </div>
      </section>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/85 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Fullscreen CCTV view for ${activeCamera.location}`}
        >
          <div className="w-full max-w-4xl rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#061326] border-b border-[#1D3552]">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-[#24A8FF]" />
                <span className="text-sm font-bold text-[#F1F5F9]">
                  {activeCamera.cameraId} — {activeCamera.location}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/20 text-[#F59E0B]">
                  DEMO SIMULATION
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] text-xs text-[#CBD5E1]"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Close</span>
                <X className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
            <div className="p-4">{renderFeedViewport(true)}</div>
          </div>
        </div>
      )}
    </>
  );
};
