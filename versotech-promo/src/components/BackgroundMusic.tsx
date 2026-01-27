import { Audio, staticFile, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface BackgroundMusicProps {
  /**
   * Source of the audio file
   * Place your music file (e.g., "music.mp3") in the public folder
   * Then use: src="music.mp3"
   *
   * RECOMMENDED FREE SOURCES:
   * - Pixabay: https://pixabay.com/music/search/corporate/
   * - Mixkit: https://mixkit.co/free-stock-music/tag/corporate/
   * - Uppbeat: https://uppbeat.io/music/category/corporate
   *
   * Look for: "Corporate Technology", "Modern Business", "Upbeat Tech"
   */
  src: string;
  volume?: number;
  fadeInDuration?: number; // frames
  fadeOutDuration?: number; // frames
  startFrom?: number; // Start playing from this second in the audio
}

/**
 * Background music component with fade in/out
 *
 * Usage:
 * 1. Download a royalty-free track from Pixabay, Mixkit, or Uppbeat
 * 2. Place the MP3 file in the `public/` folder
 * 3. Add to your composition: <BackgroundMusic src="your-track.mp3" />
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  volume = 0.4,
  fadeInDuration = 30, // 1 second
  fadeOutDuration = 60, // 2 seconds
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate volume with fade in/out
  const fadeIn = interpolate(
    frame,
    [0, fadeInDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutDuration, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const currentVolume = volume * fadeIn * fadeOut;

  return (
    <Audio
      src={staticFile(src)}
      volume={currentVolume}
      startFrom={startFrom * 30} // Convert seconds to frames
    />
  );
};

/**
 * Placeholder for when no music file is provided
 * Shows instructions in the console
 */
export const MusicPlaceholder: React.FC = () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ADD BACKGROUND MUSIC                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  1. Download a royalty-free track from:                        ║
║     • https://pixabay.com/music/search/corporate/              ║
║     • https://mixkit.co/free-stock-music/tag/corporate/        ║
║     • https://uppbeat.io/music/category/corporate              ║
║                                                                 ║
║  2. Place the MP3 file in the 'public/' folder                 ║
║                                                                 ║
║  3. In VersoPromo.tsx, uncomment the BackgroundMusic line:     ║
║     <BackgroundMusic src="your-track.mp3" volume={0.3} />      ║
║                                                                 ║
║  RECOMMENDED: Search for "Corporate Technology" or             ║
║  "Modern Business" - 60 second duration tracks work best       ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
  `);

  return null;
};
