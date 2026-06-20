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
import { PhoneMockup, PhoneScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn, slideLeft } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { resolveBrandProps, toneDelay } from '../brandUtils.js';

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

const FeatureCard = ({ icon, title, frame, delay = 0, accentColor }) => (
  <div style={{
    ...fadeUp(frame, delay),
    background: `${accentColor}26`,
    border: `2px solid ${accentColor}66`,
    borderRadius: 32,
    padding: '32px 40px',
    display: 'flex', alignItems: 'center', gap: 24,
    width: 800,
  }}>
    <span style={{ fontSize: 64, flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 42, fontWeight: FONT.weight.bold, color: BRAND.white, fontFamily: FONT.sans }}>{title}</span>
  </div>
);

export const TikTokShort = (props = {}) => {
  const frame = useCurrentFrame();
  const brand = resolveBrandProps(props);
  const { hook: _hook, subtitle: _subtitle, features: _features, ctaText: _ctaText, ctaUrl: _ctaUrl, accentColor, themeVariant, tone, screenshots } = brand;

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
      <GradientBg variant={themeVariant} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 60px', gap: 40 }}>

        {scene === 'HOOK' && (
          <>
            <HitText frame={sceneFrame} delay={0} size={88}>💰 {_hook}</HitText>
            <div style={{ ...fadeUp(sceneFrame, 20), marginTop: 16 }}>
              <HitText frame={sceneFrame} delay={toneDelay(20, tone)} size={52} color={accentColor}>There's a smarter way.</HitText>
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
            <FeatureCard icon="📸" title="Scan any receipt — instantly" frame={sceneFrame} accentColor={accentColor} />
            <div style={{ ...scaleIn(sceneFrame, toneDelay(16, tone)) }}>
              <PhoneMockup width={280} height={560} scale={1}>
                <PhoneScreen screenshots={screenshots} scale={1} />
              </PhoneMockup>
            </div>
            <div style={{ ...fadeUp(sceneFrame, toneDelay(30, tone)), fontFamily: FONT.sans, fontSize: 36, color: accentColor, fontWeight: FONT.weight.semibold, textAlign: 'center' }}>
              AI reads it in under 3 seconds ⚡
            </div>
          </>
        )}

        {scene === 'BUDGET' && (
          <>
            <FeatureCard icon="🎯" title="Smart budgets that adapt" frame={sceneFrame} accentColor={accentColor} />
            <div style={{ ...fadeUp(sceneFrame, 14), fontFamily: FONT.sans, fontSize: 36, color: BRAND.textMuted, textAlign: 'center', lineHeight: 1.4, maxWidth: 700 }}>
              Set once — SoldiKeeper rolls over, adjusts, and alerts you automatically.
            </div>
          </>
        )}

        {scene === 'SPLIT' && (
          <>
            <FeatureCard icon="🤝" title="Split bills without fights" frame={sceneFrame} accentColor={accentColor} />
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
            <HitText frame={sceneFrame} delay={toneDelay(14, tone)} size={88} color={accentColor}>Free to download.</HitText>
            <HitText frame={sceneFrame} delay={toneDelay(22, tone)} size={88}>Start saving today.</HitText>
            <div style={{ ...slideLeft(sceneFrame, toneDelay(34, tone)), marginTop: 12 }}>
              <div style={{ background: accentColor, borderRadius: 60, padding: '24px 64px' }}>
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
