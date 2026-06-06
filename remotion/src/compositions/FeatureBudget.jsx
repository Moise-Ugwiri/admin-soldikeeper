/**
 * Feature Spotlight: Smart Budgets — 1920×1080, 25s (750 frames @ 30fps)
 *
 * Scenes:
 *   0-120   Hook: "Your budget is lying to you"
 *   120-380 Visual budget tracker animation
 *   380-570 Rollover + alert features
 *   570-750 CTA
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn, barWidth } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { HOOK: 0, TRACKER: 120, FEATURES: 380, CTA: 570 };

const BudgetBar = ({ label, used, total, color, frame, delay }) => {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ ...fadeUp(frame, delay), fontFamily: FONT.sans, display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ width: 160, fontSize: 26, color: BRAND.textMuted, fontWeight: FONT.weight.medium }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%',
          borderRadius: 10,
          background: pct > 85 ? BRAND.red : pct > 65 ? BRAND.amber : color,
          width: barWidth(frame, SCENE.TRACKER + delay + 10, SCENE.TRACKER + delay + 70, pct),
          boxShadow: `0 0 12px ${color}66`,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ textAlign: 'right', minWidth: 120 }}>
        <span style={{ fontSize: 26, fontWeight: FONT.weight.bold, color: pct > 85 ? BRAND.red : BRAND.white }}>€{used}</span>
        <span style={{ fontSize: 20, color: BRAND.textFaint }}> / €{total}</span>
      </div>
    </div>
  );
};

export const FeatureBudget = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.TRACKER ? 'HOOK'
    : frame < SCENE.FEATURES ? 'TRACKER'
    : frame < SCENE.CTA ? 'FEATURES'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.featureSting)} volume={0.7} />}
      <GradientBg variant="violet" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 120px', gap: 80 }}>

        {scene === 'HOOK' && (
          <div style={{ textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), fontSize: 80, marginBottom: 24 }}>🎯</div>
            <h1 style={{ ...fadeUp(sceneFrame, 12), margin: '0 0 24px', fontSize: 76, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              {_hook}
            </h1>
            <p style={{ ...fadeUp(sceneFrame, 24), margin: 0, fontSize: 36, color: BRAND.textMuted, lineHeight: 1.5 }}>
              Static spreadsheets don't rollover. They don't alert you. They don't adapt.
            </p>
          </div>
        )}

        {scene === 'TRACKER' && (
          <div style={{ width: '100%', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 12px', fontSize: 52, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              April 2026 — Budget Snapshot
            </h2>
            <p style={{ ...fadeUp(sceneFrame, 8), margin: '0 0 40px', textAlign: 'center', color: BRAND.textMuted, fontSize: 28 }}>
              Live tracking across all categories
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1200, margin: '0 auto' }}>
              <BudgetBar label="🛒 Groceries"  used={382}  total={400}  color={BRAND.green}  frame={frame} delay={0}  />
              <BudgetBar label="🚌 Transport"  used={94}   total={150}  color={BRAND.blue}   frame={frame} delay={12} />
              <BudgetBar label="🍽 Dining"     used={218}  total={200}  color={BRAND.red}    frame={frame} delay={24} />
              <BudgetBar label="🏠 Housing"    used={1200} total={1400} color={BRAND.violet} frame={frame} delay={36} />
              <BudgetBar label="💊 Health"     used={45}   total={100}  color={BRAND.cyan}   frame={frame} delay={48} />
              <BudgetBar label="🎮 Leisure"    used={62}   total={100}  color={BRAND.amber}  frame={frame} delay={60} />
            </div>
          </div>
        )}

        {scene === 'FEATURES' && (
          <div style={{ width: '100%', textAlign: 'center', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 48px', fontSize: 60, fontWeight: FONT.weight.black, color: BRAND.white }}>
              SoldiKeeper budgets are <span style={{ color: BRAND.greenLight }}>alive</span>
            </h2>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: '🔄', title: 'Rollover logic', desc: 'Unused budget moves to next month automatically.', delay: 0 },
                { icon: '🔔', title: 'Smart alerts', desc: 'Get notified before you overspend — not after.', delay: 16 },
                { icon: '🤖', title: 'AI suggestions', desc: 'Keeper AI recommends category adjustments monthly.', delay: 32 },
              ].map((f, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, f.delay),
                  background: BRAND.surface,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24,
                  padding: '40px 40px',
                  width: 380,
                  display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 60 }}>{f.icon}</span>
                  <span style={{ fontSize: 32, fontWeight: FONT.weight.bold, color: BRAND.white }}>{f.title}</span>
                  <p style={{ margin: 0, fontSize: 24, color: BRAND.textMuted, lineHeight: 1.4, textAlign: 'center' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene === 'CTA' && (
          <div style={{ width: '100%', textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 32 }}>
              <Logo size={56} fontSize={52} center showTagline />
            </div>
            <h2 style={{ ...fadeUp(sceneFrame, 14), margin: '0 0 40px', fontSize: 68, fontWeight: FONT.weight.black, color: BRAND.white }}>
              Budgets that work as hard as you do.
            </h2>
            <div style={{ ...scaleIn(sceneFrame, 28), display: 'inline-block', background: BRAND.btnGreen, borderRadius: 60, padding: '22px 64px' }}>
              <span style={{ fontSize: 38, fontWeight: FONT.weight.bold, color: BRAND.white }}>{_ctaText} — {_ctaUrl.replace('https://', '')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
