/**
 * FeatureQuickTip — 1080×1920, 20s (600 frames @ 30fps)
 * Single-feature vertical tip for stories / reels.
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup, PhoneScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { resolveBrandProps, toneDelay } from '../brandUtils.js';

const SCENE = { HOOK: 0, TIP: 120, DEMO: 300, CTA: 480 };

export const FeatureQuickTip = (props = {}) => {
  const frame = useCurrentFrame();
  const brand = resolveBrandProps(props);
  const { hook, subtitle, features, ctaText, ctaUrl, accentColor, themeVariant, tone, screenshots } = brand;
  const tip = features?.[0] || hook;

  const scene = frame < SCENE.TIP ? 'HOOK'
    : frame < SCENE.DEMO ? 'TIP'
    : frame < SCENE.CTA ? 'DEMO'
    : 'CTA';
  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.shortHook)} volume={0.7} />}
      <GradientBg variant={themeVariant} particleCount={4} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 56px', gap: 36, textAlign: 'center', fontFamily: FONT.sans }}>
        {scene === 'HOOK' && (
          <>
            <div style={{ ...scaleIn(sceneFrame, 0) }}><Logo size={48} fontSize={42} center /></div>
            <h1 style={{ ...fadeUp(sceneFrame, toneDelay(12, tone)), margin: 0, fontSize: 72, fontWeight: 900, color: BRAND.white, lineHeight: 1.05 }}>
              Quick Tip 💡
            </h1>
            <p style={{ ...fadeUp(sceneFrame, toneDelay(24, tone)), margin: 0, fontSize: 40, color: accentColor, fontWeight: 700 }}>
              {hook}
            </p>
          </>
        )}

        {scene === 'TIP' && (
          <>
            <div style={{ ...scaleIn(sceneFrame, 0), background: `${accentColor}26`, border: `2px solid ${accentColor}66`, borderRadius: 24, padding: '24px 32px', maxWidth: 900 }}>
              <p style={{ margin: 0, fontSize: 48, fontWeight: 800, color: BRAND.white, lineHeight: 1.2 }}>{tip}</p>
            </div>
            <p style={{ ...fadeUp(sceneFrame, toneDelay(18, tone)), margin: 0, fontSize: 34, color: BRAND.textMuted, lineHeight: 1.4 }}>
              {subtitle}
            </p>
          </>
        )}

        {scene === 'DEMO' && (
          <div style={{ ...scaleIn(sceneFrame, toneDelay(10, tone)) }}>
            <PhoneMockup width={280} height={560} scale={1}>
              <PhoneScreen screenshots={screenshots} scale={1} />
            </PhoneMockup>
          </div>
        )}

        {scene === 'CTA' && (
          <>
            <p style={{ ...fadeUp(sceneFrame, 0), margin: 0, fontSize: 56, fontWeight: 900, color: BRAND.white }}>Try it now</p>
            <div style={{ ...scaleIn(sceneFrame, toneDelay(16, tone)), background: accentColor, borderRadius: 50, padding: '20px 48px' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: BRAND.white }}>{ctaText}</span>
            </div>
            <p style={{ ...fadeUp(sceneFrame, toneDelay(28, tone)), margin: 0, fontSize: 28, color: BRAND.textMuted }}>{ctaUrl.replace('https://', '')}</p>
          </>
        )}
      </div>
    </div>
  );
};