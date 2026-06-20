/**
 * TutorialWalkthrough — 1920×1080, 45s (1350 frames @ 30fps)
 * Educational 4–6 step walkthrough with screenshot slots and callouts.
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

const STEPS = [
  { title: 'Open SoldiKeeper', body: 'Launch the app and sign in to your dashboard.' },
  { title: 'Create a budget', body: 'Tap Budgets and set your first monthly category limits.' },
  { title: 'Scan a receipt', body: 'Use the camera to capture expenses automatically.' },
  { title: 'Review insights', body: 'Check spending trends and AI recommendations.' },
  { title: 'Stay on track', body: 'Enable alerts so you never overspend again.' },
];

const SCENE_DUR = 270; // 9s per step @ 30fps

const StepBadge = ({ step, frame, accentColor }) => (
  <div style={{
    ...scaleIn(frame, 0),
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    background: `${accentColor}33`,
    border: `2px solid ${accentColor}`,
    borderRadius: 40,
    padding: '10px 24px',
    fontFamily: FONT.sans,
    fontSize: 28,
    fontWeight: 700,
    color: accentColor,
  }}>
    Step {step}
  </div>
);

export const TutorialWalkthrough = (props = {}) => {
  const frame = useCurrentFrame();
  const brand = resolveBrandProps(props);
  const { hook, subtitle, features, ctaText, ctaUrl, accentColor, themeVariant, tone, screenshots } = brand;

  const steps = (features || []).slice(0, 6).map((f, i) => ({
    title: typeof f === 'string' ? f : STEPS[i]?.title || `Step ${i + 1}`,
    body: STEPS[i]?.body || subtitle,
  }));
  if (steps.length < 4) {
    STEPS.slice(0, 5).forEach((s, i) => {
      if (!steps[i]) steps[i] = s;
    });
  }

  const stepIndex = Math.min(Math.floor(frame / SCENE_DUR), steps.length - 1);
  const sceneFrame = frame - stepIndex * SCENE_DUR;
  const isIntro = frame < 120;
  const isOutro = frame >= steps.length * SCENE_DUR;
  const current = steps[stepIndex] || steps[0];

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.mainTheme)} volume={0.55} />}
      <GradientBg variant={themeVariant} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', height: '100%', padding: '0 100px', gap: 80 }}>
        {isIntro && (
          <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 24 }}>
              <Logo size={48} fontSize={44} center />
            </div>
            <h1 style={{ ...fadeUp(sceneFrame, toneDelay(12, tone)), margin: '0 0 20px', fontSize: 72, fontWeight: 900, color: BRAND.white, lineHeight: 1.1 }}>
              {hook}
            </h1>
            <p style={{ ...fadeUp(sceneFrame, toneDelay(24, tone)), margin: 0, fontSize: 32, color: BRAND.textMuted, maxWidth: 800, marginInline: 'auto' }}>
              {subtitle}
            </p>
          </div>
        )}

        {!isIntro && !isOutro && (
          <>
            <div style={{ flex: 1, fontFamily: FONT.sans }}>
              <StepBadge step={stepIndex + 1} frame={sceneFrame} accentColor={accentColor} />
              <h2 style={{ ...fadeUp(sceneFrame, toneDelay(14, tone)), margin: '28px 0 16px', fontSize: 64, fontWeight: 900, color: BRAND.white, lineHeight: 1.1 }}>
                {current.title}
              </h2>
              <p style={{ ...fadeUp(sceneFrame, toneDelay(26, tone)), margin: 0, fontSize: 30, color: BRAND.textMuted, lineHeight: 1.5, maxWidth: 560 }}>
                {current.body}
              </p>
            </div>
            <div style={{ ...scaleIn(sceneFrame, toneDelay(18, tone)), flexShrink: 0 }}>
              <PhoneMockup width={300} height={590} scale={1.15}>
                <PhoneScreen screenshots={screenshots} scale={1.15} />
              </PhoneMockup>
            </div>
          </>
        )}

        {isOutro && (
          <div style={{ flex: 1, textAlign: 'center', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 28px', fontSize: 68, fontWeight: 900, color: BRAND.white }}>
              You're ready to go!
            </h2>
            <div style={{ ...scaleIn(sceneFrame, toneDelay(20, tone)), display: 'inline-block', background: accentColor, borderRadius: 60, padding: '22px 64px' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: BRAND.white }}>{ctaText} — {ctaUrl.replace('https://', '')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};