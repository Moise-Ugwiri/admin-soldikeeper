import { registerRoot, Composition } from 'remotion';
import React from 'react';

import { FullPromoYouTube } from './compositions/FullPromoYouTube.jsx';
import { TikTokShort }      from './compositions/TikTokShort.jsx';
import { InstagramSquare }  from './compositions/InstagramSquare.jsx';
import { FeatureReceipt }   from './compositions/FeatureReceipt.jsx';
import { FeatureBudget }    from './compositions/FeatureBudget.jsx';
import { FeatureSplit }     from './compositions/FeatureSplit.jsx';
import { LinkedInPromo }    from './compositions/LinkedInPromo.jsx';
import { DEFAULT_PROPS }    from './defaultProps.js';

export const RemotionRoot = () => (
  <>
    {/* ── PLATFORM PROMOS ────────────────────────────────── */}

    {/* YouTube — 1920×1080 — 60s — Full brand story */}
    <Composition
      id="YouTube"
      component={FullPromoYouTube}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />

    {/* TikTok / Reels — 1080×1920 — 30s — Hook-first vertical */}
    <Composition
      id="TikTok"
      component={TikTokShort}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_PROPS}
    />

    {/* Instagram Square — 1080×1080 — 15s — Clean, minimal */}
    <Composition
      id="Instagram"
      component={InstagramSquare}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />

    {/* LinkedIn — 1920×1080 — 45s — Professional, B2B */}
    <Composition
      id="LinkedIn"
      component={LinkedInPromo}
      durationInFrames={1350}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />

    {/* ── FEATURE SPOTLIGHTS ─────────────────────────────── */}

    {/* Receipt Scanner — 1920×1080 — 25s */}
    <Composition
      id="FeatureReceipt"
      component={FeatureReceipt}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />

    {/* Smart Budgets — 1920×1080 — 25s */}
    <Composition
      id="FeatureBudget"
      component={FeatureBudget}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />

    {/* Split Bills — 1920×1080 — 25s */}
    <Composition
      id="FeatureSplit"
      component={FeatureSplit}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={DEFAULT_PROPS}
    />
  </>
);

registerRoot(RemotionRoot);
