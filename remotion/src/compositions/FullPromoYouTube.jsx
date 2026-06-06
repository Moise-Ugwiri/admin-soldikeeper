/**
 * YouTube Full Promo — 1920×1080, 60s (1800 frames @ 30fps)
 *
 * Scenes:
 *   0-180   Hook: "Your money is telling a story — are you listening?"
 *   180-420  Problem: receipts/budgets chaos
 *   420-660  Solution intro: SoldiKeeper
 *   660-900  Feature 1: AI receipt scanning
 *   900-1140 Feature 2: Smart budgets
 *   1140-1380 Feature 3: Split bills
 *   1380-1620 Social proof / stats
 *   1620-1800 CTA
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup, DashboardScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT, EASE } from '../theme.js';
import { fadeUp, scaleIn, slideLeft, slideRight, springIn, counter, barWidth } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { HOOK: 0, PROBLEM: 180, SOLUTION: 420, RECEIPT: 660, BUDGET: 900, SPLIT: 1140, PROOF: 1380, CTA: 1620 };

const Pill = ({ children, color = BRAND.green, delay = 0, frame }) => (
  <div style={{
    ...scaleIn(frame, delay),
    display: 'inline-flex', alignItems: 'center',
    padding: '8px 20px',
    background: `rgba(${color === BRAND.green ? '16,185,129' : '59,130,246'},0.15)`,
    border: `1.5px solid ${color}`,
    borderRadius: 40,
    fontSize: 22, fontWeight: FONT.weight.semibold,
    color,
    fontFamily: FONT.sans,
    letterSpacing: 0.5,
  }}>
    {children}
  </div>
);

const BigStat = ({ value, label, frame, delay = 0 }) => (
  <div style={{
    ...fadeUp(frame, delay),
    textAlign: 'center',
    fontFamily: FONT.sans,
    display: 'flex', flexDirection: 'column', gap: 8,
    background: BRAND.surface,
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 24,
    padding: '36px 48px',
    minWidth: 220,
  }}>
    <span style={{ fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.greenLight, lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 22, color: BRAND.textMuted, fontWeight: FONT.weight.medium }}>{label}</span>
  </div>
);

const FeatureSlide = ({ icon, title, body, frame, sceneStart, bgVariant = 'green' }) => {
  const local = frame - sceneStart;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
      <GradientBg variant={bgVariant} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', padding: '0 120px', gap: 80 }}>
        {/* Left: text */}
        <div style={{ flex: 1, fontFamily: FONT.sans }}>
          <div style={{ ...scaleIn(local, 0), fontSize: 80, marginBottom: 24 }}>{icon}</div>
          <h2 style={{ ...fadeUp(local, 10), margin: '0 0 20px', fontSize: 68, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>{title}</h2>
          <p style={{ ...fadeUp(local, 20), margin: 0, fontSize: 32, color: BRAND.textMuted, lineHeight: 1.5, maxWidth: 560 }}>{body}</p>
        </div>
        {/* Right: phone */}
        <div style={{ ...slideRight(local, 15, 80), flexShrink: 0 }}>
          <PhoneMockup width={300} height={590} scale={1.1}>
            <DashboardScreen scale={1.1} />
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
};

export const FullPromoYouTube = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.PROBLEM ? 'HOOK'
    : frame < SCENE.SOLUTION ? 'PROBLEM'
    : frame < SCENE.RECEIPT ? 'SOLUTION'
    : frame < SCENE.BUDGET ? 'RECEIPT'
    : frame < SCENE.SPLIT ? 'BUDGET'
    : frame < SCENE.PROOF ? 'SPLIT'
    : frame < SCENE.CTA ? 'PROOF'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  // Global opacity for scene transitions
  const sceneProgress = sceneFrame;
  const fadeOut = interpolate(sceneProgress, [200, 220], [1, 0], EASE.clamp);

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', fontFamily: FONT.sans, background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.mainTheme)} volume={0.7} />}

      {/* ── SCENE 1: HOOK ── */}
      {scene === 'HOOK' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
          <GradientBg variant="main" />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 120px' }}>
            <div style={{ ...fadeUp(sceneFrame, 0, 20), marginBottom: 24 }}>
              <Pill frame={sceneFrame} delay={0} color={BRAND.green}>📊 Smarter Money Management</Pill>
            </div>
            <h1 style={{
              ...fadeUp(sceneFrame, 12, 22),
              margin: '0 0 32px',
              fontSize: 92,
              fontWeight: FONT.weight.black,
              color: BRAND.white,
              lineHeight: 1.08,
              letterSpacing: -2,
            }}>
              {_hook}
            </h1>
            <div style={{ ...fadeUp(sceneFrame, 28, 20) }}>
              <Logo size={52} fontSize={44} showTagline center />
            </div>
          </div>
        </div>
      )}

      {/* ── SCENE 2: PROBLEM ── */}
      {scene === 'PROBLEM' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
          <GradientBg variant="main" />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 120px' }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 48px', fontSize: 72, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              Managing money is <span style={{ color: BRAND.amber }}>hard.</span>
            </h2>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              {[
                { icon: '🧾', text: 'Lost receipts everywhere', delay: 8 },
                { icon: '😰', text: 'Budget overruns — again', delay: 16 },
                { icon: '🔢', text: 'Manual tracking is exhausting', delay: 24 },
                { icon: '💸', text: 'Group bills end in arguments', delay: 32 },
              ].map((item, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, item.delay),
                  background: BRAND.surface,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 20,
                  padding: '32px 28px',
                  width: 220,
                  display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 56 }}>{item.icon}</span>
                  <p style={{ margin: 0, fontSize: 22, color: BRAND.textMuted, fontWeight: FONT.weight.medium, textAlign: 'center', lineHeight: 1.3 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SCENE 3: SOLUTION ── */}
      {scene === 'SOLUTION' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', opacity: fadeOut }}>
          <GradientBg variant="green" />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', padding: '0 120px', gap: 80 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 28 }}>
                <Logo size={60} fontSize={56} showTagline />
              </div>
              <h2 style={{ ...fadeUp(sceneFrame, 16), margin: '0 0 24px', fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
                One app to rule<br /><span style={{ color: BRAND.greenLight }}>your finances.</span>
              </h2>
              <p style={{ ...fadeUp(sceneFrame, 24), margin: 0, fontSize: 30, color: BRAND.textMuted, lineHeight: 1.5, maxWidth: 520 }}>
                AI-powered insights, instant receipt scanning, smart budgets, and effortless bill splitting.
              </p>
            </div>
            <div style={{ ...slideRight(sceneFrame, 12, 100), flexShrink: 0 }}>
              <PhoneMockup width={300} height={590} scale={1.15}>
                <DashboardScreen scale={1.15} />
              </PhoneMockup>
            </div>
          </div>
        </div>
      )}

      {/* ── SCENE 4-6: FEATURES ── */}
      {scene === 'RECEIPT' && <FeatureSlide icon="📸" title={_features[0] || 'Scan receipts instantly'} body="Point your camera at any receipt. AI reads it in under 3 seconds — no typing needed." frame={frame} sceneStart={SCENE.RECEIPT} bgVariant="blue" />}
      {scene === 'BUDGET' && <FeatureSlide icon="🎯" title={_features[1] || 'Budgets that adapt to you'} body="Smart categories, rollover logic, and real-time alerts keep you on track — automatically." frame={frame} sceneStart={SCENE.BUDGET} bgVariant="violet" />}
      {scene === 'SPLIT' && <FeatureSlide icon="🤝" title={_features[2] || 'Split bills, zero drama'} body="Shared expenses, debt simplification, settlement in one tap. Everyone stays happy." frame={frame} sceneStart={SCENE.SPLIT} bgVariant="amber" />}

      {/* ── SCENE 7: SOCIAL PROOF ── */}
      {scene === 'PROOF' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
          <GradientBg variant="green" />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 60px', fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.white }}>
              Join thousands already saving smarter
            </h2>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
              <BigStat value={`${counter(frame, 0, 50, SCENE.PROOF, SCENE.PROOF + 90)}K+`} label="Transactions tracked" frame={sceneFrame} delay={0} />
              <BigStat value={`${counter(frame, 0, 98, SCENE.PROOF, SCENE.PROOF + 90)}%`} label="Receipt accuracy" frame={sceneFrame} delay={12} />
              <BigStat value={`${counter(frame, 0, 4, SCENE.PROOF, SCENE.PROOF + 90)}min`} label="Avg daily review time" frame={sceneFrame} delay={24} />
              <BigStat value="⭐ 4.9" label="App store rating" frame={sceneFrame} delay={36} />
            </div>
          </div>
        </div>
      )}

      {/* ── SCENE 8: CTA ── */}
      {scene === 'CTA' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <GradientBg variant="main" />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 80px' }}>
            <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 32 }}>
              <Logo size={64} fontSize={60} showTagline center />
            </div>
            <h2 style={{ ...fadeUp(sceneFrame, 14), margin: '0 0 24px', fontSize: 80, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              Start for <span style={{ color: BRAND.greenLight }}>free</span> today.
            </h2>
            <p style={{ ...fadeUp(sceneFrame, 22), margin: '0 0 48px', fontSize: 36, color: BRAND.textMuted }}>
              Available on iOS &amp; Android
            </p>
            <div style={{ ...scaleIn(sceneFrame, 30), display: 'inline-block', background: BRAND.btnGreen, borderRadius: 60, padding: '24px 72px' }}>
              <span style={{ fontSize: 40, fontWeight: FONT.weight.bold, color: BRAND.white, letterSpacing: 0.5 }}>
                {_ctaText}
              </span>
            </div>
            <p style={{ ...fadeUp(sceneFrame, 48), margin: '24px 0 0', fontSize: 26, color: BRAND.textFaint }}>
              {_ctaUrl.replace('https://', '')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
