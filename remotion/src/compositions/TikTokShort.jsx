/**
 * TikTok / Reels Short — 1080×1920, 30s (900 frames @ 30fps)
 *
 * Hook-first format. Bold vertical design.
 *
 * Scenes:
 *   0-90    Hook text
 *   90-240  Problem (1 pain point per beat)
 *   240-420 Feature reveal: receipt scan
 *   420-600 Feature reveal: budget
 *   600-750 Feature reveal: split
 *   750-900 CTA
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup, DashboardScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn, slideLeft } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { HOOK: 0, PROBLEM: 90, RECEIPT: 240, BUDGET: 420, SPLIT: 600, CTA: 750 };

const HitText = ({ children, frame, delay = 0, size = 96, color = BRAND.white }) => (
  <div style={{
    ...scaleIn(frame, delay, 10),
    fontFamily: FONT.sans,
    fontSize: size,
    fontWeight: FONT.weight.black,
    color,
    lineHeight: 1.05,
    textAlign: 'center',
    letterSpacing: -2,
    textShadow: '0 4px 20px rgba(0,0,0,0.6)',
  }}>
    {children}
  </div>
);

const FeatureCard = ({ icon, title, frame, delay = 0 }) => (
  <div style={{
    ...fadeUp(frame, delay),
    background: 'rgba(16,185,129,0.15)',
    border: '2px solid rgba(16,185,129,0.4)',
    borderRadius: 32,
    padding: '32px 40px',
    display: 'flex', alignItems: 'center', gap: 24,
    width: 800,
  }}>
    <span style={{ fontSize: 64, flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 42, fontWeight: FONT.weight.bold, color: BRAND.white, fontFamily: FONT.sans }}>{title}</span>
  </div>
);

export const TikTokShort = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.PROBLEM ? 'HOOK'
    : frame < SCENE.RECEIPT ? 'PROBLEM'
    : frame < SCENE.BUDGET ? 'RECEIPT'
    : frame < SCENE.SPLIT ? 'BUDGET'
    : frame < SCENE.CTA ? 'SPLIT'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.shortHook)} volume={0.8} />}
      <GradientBg variant="green" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 60px', gap: 40 }}>

        {scene === 'HOOK' && (
          <>
            <HitText frame={sceneFrame} delay={0} size={88}>💰 {_hook}</HitText>
            <div style={{ ...fadeUp(sceneFrame, 20), marginTop: 16 }}>
              <HitText frame={sceneFrame} delay={20} size={52} color={BRAND.green}>There's a smarter way.</HitText>
            </div>
          </>
        )}

        {scene === 'PROBLEM' && (
          <>
            <HitText frame={sceneFrame} size={72} color={BRAND.amber}>The problem?</HitText>
            {[
              { text: '🧾 Receipts pile up', delay: 10 },
              { text: '😰 Budgets overflow', delay: 25 },
              { text: '💸 Bills cause drama', delay: 40 },
            ].map((item, i) => (
              <div key={i} style={{ ...fadeUp(sceneFrame, item.delay), fontFamily: FONT.sans, fontSize: 52, fontWeight: FONT.weight.bold, color: BRAND.textMuted, textAlign: 'center' }}>
                {item.text}
              </div>
            ))}
          </>
        )}

        {scene === 'RECEIPT' && (
          <>
            <FeatureCard icon="📸" title="Scan any receipt — instantly" frame={sceneFrame} />
            <div style={{ ...scaleIn(sceneFrame, 16) }}>
              <PhoneMockup width={280} height={560} scale={1}>
                <DashboardScreen scale={1} />
              </PhoneMockup>
            </div>
            <div style={{ ...fadeUp(sceneFrame, 30), fontFamily: FONT.sans, fontSize: 36, color: BRAND.green, fontWeight: FONT.weight.semibold, textAlign: 'center' }}>
              AI reads it in under 3 seconds ⚡
            </div>
          </>
        )}

        {scene === 'BUDGET' && (
          <>
            <FeatureCard icon="🎯" title="Smart budgets that adapt" frame={sceneFrame} />
            <div style={{ ...fadeUp(sceneFrame, 14), fontFamily: FONT.sans, fontSize: 36, color: BRAND.textMuted, textAlign: 'center', lineHeight: 1.4, maxWidth: 700 }}>
              Set once — SoldiKeeper rolls over, adjusts, and alerts you automatically.
            </div>
          </>
        )}

        {scene === 'SPLIT' && (
          <>
            <FeatureCard icon="🤝" title="Split bills without fights" frame={sceneFrame} />
            <div style={{ ...fadeUp(sceneFrame, 14), fontFamily: FONT.sans, fontSize: 36, color: BRAND.textMuted, textAlign: 'center', lineHeight: 1.4, maxWidth: 700 }}>
              Add people, assign costs, settle with one tap.
            </div>
          </>
        )}

        {scene === 'CTA' && (
          <>
            <div style={{ ...scaleIn(sceneFrame, 0) }}>
              <Logo size={56} fontSize={52} center />
            </div>
            <HitText frame={sceneFrame} delay={14} size={88} color={BRAND.greenLight}>Free to download.</HitText>
            <HitText frame={sceneFrame} delay={22} size={88}>Start saving today.</HitText>
            <div style={{ ...slideLeft(sceneFrame, 34), marginTop: 12 }}>
              <div style={{ background: BRAND.btnGreen, borderRadius: 60, padding: '24px 64px' }}>
                <span style={{ fontFamily: FONT.sans, fontSize: 44, fontWeight: FONT.weight.bold, color: BRAND.white }}>
                  🔗 {_ctaUrl.replace('https://', '')}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
