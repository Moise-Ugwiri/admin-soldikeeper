/**
 * Feature Spotlight: Split Bills — 1920×1080, 25s (750 frames @ 30fps)
 *
 * Scenes:
 *   0-120   Hook: "Group expenses — the awkward moment"
 *   120-380 Demo: shared expense dashboard
 *   380-570 Settlement flow
 *   570-750 CTA
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn, slideLeft } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { HOOK: 0, DEMO: 120, SETTLE: 380, CTA: 570 };

const Avatar = ({ name, color, size = 56 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: '50%',
    background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.44, fontWeight: FONT.weight.bold,
    color: BRAND.white, fontFamily: FONT.sans,
    flexShrink: 0,
    boxShadow: `0 2px 12px ${color}66`,
  }}>
    {name[0]}
  </div>
);

const DebtRow = ({ from, to, amount, fromColor, toColor, frame, delay }) => (
  <div style={{
    ...fadeUp(frame, delay),
    display: 'flex', alignItems: 'center', gap: 20,
    background: BRAND.surface,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '18px 28px',
    fontFamily: FONT.sans,
  }}>
    <Avatar name={from} color={fromColor} size={52} />
    <span style={{ fontSize: 24, color: BRAND.textMuted, fontWeight: FONT.weight.medium }}>owes</span>
    <Avatar name={to} color={toColor} size={52} />
    <span style={{ marginLeft: 'auto', fontSize: 32, fontWeight: FONT.weight.bold, color: BRAND.amber }}>€{amount}</span>
    <div style={{ background: BRAND.btnGreen, borderRadius: 30, padding: '8px 22px' }}>
      <span style={{ fontSize: 22, fontWeight: FONT.weight.semibold, color: BRAND.white }}>Settle ✓</span>
    </div>
  </div>
);

export const FeatureSplit = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.DEMO ? 'HOOK'
    : frame < SCENE.SETTLE ? 'DEMO'
    : frame < SCENE.CTA ? 'SETTLE'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.featureSting)} volume={0.7} />}
      <GradientBg variant="amber" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 120px', gap: 80 }}>

        {scene === 'HOOK' && (
          <div style={{ textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), fontSize: 80, marginBottom: 24 }}>🤝</div>
            <h1 style={{ ...fadeUp(sceneFrame, 12), margin: '0 0 24px', fontSize: 76, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              {_hook}
            </h1>
            <p style={{ ...fadeUp(sceneFrame, 24), margin: 0, fontSize: 36, color: BRAND.textMuted, lineHeight: 1.5 }}>
              Shared dinners, trips, rent. Group expenses always end in confusion.
            </p>
          </div>
        )}

        {scene === 'DEMO' && (
          <div style={{ width: '100%', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 8px', fontSize: 52, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              🏖️ Barcelona Trip — Shared Expenses
            </h2>
            <p style={{ ...fadeUp(sceneFrame, 8), margin: '0 0 32px', textAlign: 'center', color: BRAND.textMuted, fontSize: 26 }}>
              4 friends, 1 app, zero arguments
            </p>
            <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
              {/* Members */}
              <div style={{ ...fadeUp(sceneFrame, 12), background: BRAND.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '24px 28px', minWidth: 260 }}>
                <p style={{ margin: '0 0 16px', fontSize: 24, color: BRAND.textMuted, fontWeight: FONT.weight.semibold }}>Members</p>
                {[['Alice', BRAND.green], ['Bob', BRAND.blue], ['Carol', BRAND.violet], ['David', BRAND.amber]].map(([name, color], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Avatar name={name} color={color} size={44} />
                    <span style={{ fontSize: 26, color: BRAND.white, fontWeight: FONT.weight.medium }}>{name}</span>
                  </div>
                ))}
              </div>
              {/* Expense list */}
              <div style={{ flex: 1 }}>
                {[
                  { who: 'Alice', item: 'Hotel Night 1', amount: '€320', delay: 16 },
                  { who: 'Bob', item: 'Dinner at La Mar', amount: '€186', delay: 26 },
                  { who: 'Alice', item: 'Day trip tickets', amount: '€96', delay: 36 },
                  { who: 'Carol', item: 'Taxi × 3', amount: '€47', delay: 46 },
                  { who: 'David', item: 'Groceries (beach)', amount: '€38', delay: 56 },
                ].map((e, i) => (
                  <div key={i} style={{
                    ...slideLeft(sceneFrame, e.delay, 60, 18),
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: BRAND.surface,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '14px 22px',
                    marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 22, color: BRAND.textMuted, width: 80 }}>{e.who}</span>
                    <span style={{ flex: 1, fontSize: 26, color: BRAND.white }}>{e.item}</span>
                    <span style={{ fontSize: 28, fontWeight: FONT.weight.bold, color: BRAND.amber }}>{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {scene === 'SETTLE' && (
          <div style={{ width: '100%', maxWidth: 1100, fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 12px', fontSize: 56, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              Debt simplified automatically 🤖
            </h2>
            <p style={{ ...fadeUp(sceneFrame, 8), margin: '0 0 36px', textAlign: 'center', color: BRAND.green, fontSize: 28, fontWeight: FONT.weight.semibold }}>
              From 12 IOUs → 3 transfers
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <DebtRow from="Bob" to="Alice" amount="94.50" fromColor={BRAND.blue} toColor={BRAND.green} frame={frame} delay={16} />
              <DebtRow from="Carol" to="Alice" amount="62.25" fromColor={BRAND.violet} toColor={BRAND.green} frame={frame} delay={30} />
              <DebtRow from="David" to="Alice" amount="58.00" fromColor={BRAND.amber} toColor={BRAND.green} frame={frame} delay={44} />
            </div>
            <div style={{ ...scaleIn(sceneFrame, 60), marginTop: 28, textAlign: 'center' }}>
              <span style={{ fontSize: 32, color: BRAND.textMuted }}>Everyone settled in </span>
              <span style={{ fontSize: 36, fontWeight: FONT.weight.bold, color: BRAND.greenLight }}>one tap</span>
              <span style={{ fontSize: 32 }}> ✅</span>
            </div>
          </div>
        )}

        {scene === 'CTA' && (
          <div style={{ width: '100%', textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 32 }}>
              <Logo size={56} fontSize={52} center showTagline />
            </div>
            <h2 style={{ ...fadeUp(sceneFrame, 14), margin: '0 0 40px', fontSize: 68, fontWeight: FONT.weight.black, color: BRAND.white }}>
              Group money. Zero drama.
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
