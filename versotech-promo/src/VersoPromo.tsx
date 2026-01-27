import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { Background } from "./components/Background";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { FeatureBarrageScene } from "./scenes/FeatureBarrageScene";
import { MetricBlitzScene } from "./scenes/MetricBlitzScene";
import { StackScene } from "./scenes/StackScene";
import { PositioningScene } from "./scenes/PositioningScene";
import { CTAScene } from "./scenes/CTAScene";
import { BackgroundMusic } from "./components/BackgroundMusic";

/**
 * VERSOTECH Promotional Video - v6.1: FAST & PUNCHY (Enhanced)
 *
 * Duration: 60 seconds (1800 frames @ 30fps)
 * Energy: HIGH-TEMPO, quick cuts, kinetic typography
 * Tone: Confident, direct, no corporate fluff
 *
 * ENHANCEMENTS in v6.1:
 * - Particle effects & rising gold particles
 * - Grid lines for tech aesthetic
 * - Bouncing text animations
 * - Ken Burns effect on screenshots
 * - Wipe transitions between feature slides
 * - Progress indicators
 * - Corner badges on feature slides
 * - Flash effects for impact
 * - Animated counters
 * - Split text reveals
 *
 * Scene Breakdown:
 * ACT 1: HOOK (0-6s)
 * - Scene 1: Logo Slam (0-2s) - 60 frames - Bouncing letters, particles, flash
 * - Scene 2: The Problem (2-6s) - 120 frames - Strikethrough sequence
 *
 * ACT 2: THE PLATFORM (6-40s)
 * - Scene 3: Overview Shot (6-10s) - 120 frames - Dashboard zoom
 * - Scene 4: Feature Barrage (10-28s) - 540 frames - 7 rapid slides with badges
 * - Scene 5: Metric Blitz (28-34s) - 180 frames - Flying numbers
 * - Scene 6: The Stack (34-40s) - 180 frames - Fanning cards
 *
 * ACT 3: CLOSE (40-60s)
 * - Scene 7: Positioning (40-46s) - 180 frames - Split text reveal (FASTER)
 * - Scene 8: CTA (46-60s) - 420 frames - Stats, domain, social proof
 *
 * TO ADD MUSIC:
 * 1. Download a royalty-free track from Pixabay, Mixkit, or Uppbeat
 * 2. Place the MP3 in the public/ folder
 * 3. Uncomment the BackgroundMusic import and component below
 */

export const VersoPromo: React.FC = () => {
  // Timing calculations (in frames @ 30fps)
  const fps = 30;
  const transitionDuration = 3; // ~100ms - VERY FAST (hard cut feel)

  // Scene durations - v6.1 Enhanced timing (faster ending)
  const introDuration = 2 * fps;              // 2 seconds (60 frames) - Logo Slam
  const problemDuration = 4 * fps;            // 4 seconds (120 frames) - The Problem
  const overviewDuration = 4 * fps;           // 4 seconds (120 frames) - Overview Shot
  const featureBarrageDuration = 18 * fps;    // 18 seconds (540 frames) - Feature Barrage
  const metricBlitzDuration = 6 * fps;        // 6 seconds (180 frames) - Metric Blitz
  const stackDuration = 6 * fps;              // 6 seconds (180 frames) - The Stack
  const positioningDuration = 6 * fps;        // 6 seconds (180 frames) - Positioning (FASTER)
  const ctaDuration = 14 * fps;               // 14 seconds (420 frames) - CTA

  // Total: 60 seconds (1800 frames)

  return (
    <AbsoluteFill>
      {/* Persistent Animated Background - Pure black with subtle gold glow */}
      <Background />

      {/* Background Music - Jazz Rumble track */}
      <BackgroundMusic
        src="jazz-rumble-airstream-main-version-41993-01-33.mp3"
        volume={0.35}
        fadeInDuration={45}
        fadeOutDuration={90}
      />

      {/* Scene Transitions - Hard cuts with minimal fade */}
      <TransitionSeries>
        {/* ACT 1: HOOK */}

        {/* Scene 1: Logo Slam (0-2s) */}
        <TransitionSeries.Sequence durationInFrames={introDuration}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 2: The Problem (2-6s) */}
        <TransitionSeries.Sequence durationInFrames={problemDuration}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* ACT 2: THE PLATFORM */}

        {/* Scene 3: Overview Shot (6-10s) */}
        <TransitionSeries.Sequence durationInFrames={overviewDuration}>
          <SolutionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 4: Feature Barrage (10-28s) */}
        <TransitionSeries.Sequence durationInFrames={featureBarrageDuration}>
          <FeatureBarrageScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 5: Metric Blitz (28-34s) */}
        <TransitionSeries.Sequence durationInFrames={metricBlitzDuration}>
          <MetricBlitzScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 6: The Stack (34-40s) */}
        <TransitionSeries.Sequence durationInFrames={stackDuration}>
          <StackScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* ACT 3: CLOSE */}

        {/* Scene 7: Positioning (40-46s) - FASTER */}
        <TransitionSeries.Sequence durationInFrames={positioningDuration}>
          <PositioningScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 8: CTA (46-60s) - More time with dynamic content */}
        <TransitionSeries.Sequence durationInFrames={ctaDuration}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
