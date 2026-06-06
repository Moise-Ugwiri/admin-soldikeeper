/**
 * Feature Spotlight: Receipt Scanning — 1920×1080, 25s (750 frames @ 30fps)
 *
 * Scenes:
 *   0-120   Pain: manual entry is slow
 *   120-360  Demo: phone camera → scanned receipt
 *   360-570  Stats (speed, accuracy)
 *   570-750  CTA + logo
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile, interpolate } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup } from '../components/PhoneMockup.jsx';
import { BRAND, FONT, EASE } from '../theme.js';
import { fadeUp, scaleIn, slideLeft, slideRight, counter, barWidth } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { PAIN: 0, DEMO: 120, STATS: 360, CTA: 570 };

/** Animated receipt on screen */
const ReceiptScreen = ({ frame, scale = 1 }) => {
  const items = [
    'Grocery Store        €12.40',
    'Coffee & Snacks      €4.30',
    'Pharmacy             €8.70',
    'Fuel Station         €54.00',
  ];
  const showAll = frame > 60;
  return (
    <div style={{ padding: `${40 * scale}px ${14 * scale}px`, fontFamily: FONT.mono, color: BRAND.white, fontSize: 11 * scale, lineHeight: 1.9 }}>
      <div style={{ ...scaleIn(frame, 0), fontSize: 13 * scale, fontWeight: FONT.weight.bold, color: BRAND.green, marginBottom: 8 * scale, textAlign: 'center' }}>
        ✅ Receipt Detected
      </div>
      <div style={{ ...fadeUp(frame, 8), color: BRAND.textMuted, fontSize: 10 * scale, textAlign: 'center', marginBottom: 14 * scale }}>
        Extracting items…
      </div>
      {items.map((line, i) => (
        <div key={i} style={{ ...fadeUp(frame, 18 + i * 10), borderBottom: `1px solid rgba(255,255,255,0.06)`, paddingBottom: 4 * scale }}>
          {line}
        </div>
      ))}
      {showAll && (
        <div style={{ ...scaleIn(frame - 60, 0), marginTop: 10 * scale, textAlign: 'center', fontFamily: FONT.sans, fontWeight: FONT.weight.bold, color: BRAND.greenLight, fontSize: 12 * scale }}>
          Total: €79.40 — Saved! 🎉
        </div>
      )}
    </div>
  );
};

export const FeatureReceipt = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.DEMO ? 'PAIN'
    : frame < SCENE.STATS ? 'DEMO'
    : frame < SCENE.CTA ? 'STATS'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.featureSting)} volume={0.7} />}
      <GradientBg variant="blue" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 120px', gap: 80 }}>

        {scene === 'PAIN' && (
          <div style={{ textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), fontSize: 80, marginBottom: 24 }}>🧾</div>
            <h1 style={{ ...fadeUp(sceneFrame, 12), margin: '0 0 24px', fontSize: 76, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              {_hook}
            </h1>
            <p style={{ ...fadeUp(sceneFrame, 24), margin: 0, fontSize: 36, color: BRAND.textMuted }}>
              The average person spends 4 hours/month on expense tracking.
            </p>
          </div>
        )}

        {scene === 'DEMO' && (
          <>
            <div style={{ flex: 1, fontFamily: FONT.sans }}>
              <div style={{ ...scaleIn(sceneFrame, 0), fontSize: 72, marginBottom: 20 }}>📸</div>
              <h2 style={{ ...fadeUp(sceneFrame, 10), margin: '0 0 20px', fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
                Point. Scan.<br /><span style={{ color: BRAND.green }}>Done.</span>
              </h2>
              <p style={{ ...fadeUp(sceneFrame, 20), margin: '0 0 32px', fontSize: 32, color: BRAND.textMuted, lineHeight: 1.5 }}>
                Our AI reads the receipt in under 3 seconds and automatically categorizes every item.
              </p>
              {/* Scan progress */}
              <div style={{ ...fadeUp(sceneFrame, 30) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, fontFamily: FONT.sans }}>
                  <span style={{ color: BRAND.textMuted, fontSize: 24 }}>Accuracy</span>
                  <span style={{ color: BRAND.greenLight, fontWeight: FONT.weight.bold, fontSize: 28 }}>98%</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 6, width: 480, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 6, background: BRAND.btnGreen, width: barWidth(frame, SCENE.DEMO + 30, SCENE.DEMO + 100, 98) }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontFamily: FONT.sans }}>
                  <span style={{ color: BRAND.textMuted, fontSize: 24 }}>Speed</span>
                  <span style={{ color: BRAND.greenLight, fontWeight: FONT.weight.bold, fontSize: 28 }}>2.8s avg</span>
                </div>
              </div>
            </div>
            <div style={{ ...slideRight(sceneFrame, 12, 80), flexShrink: 0 }}>
              <PhoneMockup width={300} height={590} scale={1.1}>
                <ReceiptScreen frame={sceneFrame - 20} scale={1.1} />
              </PhoneMockup>
            </div>
          </>
        )}

        {scene === 'STATS' && (
          <div style={{ width: '100%', textAlign: 'center', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 48px', fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.white }}>
              By the numbers
            </h2>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
              {[
                { val: `${counter(frame, 0, 98, SCENE.STATS, SCENE.STATS + 80)}%`, label: 'Recognition accuracy', color: BRAND.green, delay: 0 },
                { val: `${counter(frame, 5, 2, SCENE.STATS, SCENE.STATS + 80)}s`, label: 'Average scan time', color: BRAND.blue, delay: 14 },
                { val: `${counter(frame, 0, 20, SCENE.STATS, SCENE.STATS + 80)}+`, label: 'Supported currencies', color: BRAND.violet, delay: 28 },
              ].map((s, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, s.delay),
                  background: BRAND.surface,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 24,
                  padding: '40px 56px',
                  display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 72, fontWeight: FONT.weight.black, color: s.color, lineHeight: 1 }}>{s.val}</span>
                  <span style={{ fontSize: 28, color: BRAND.textMuted }}>{s.label}</span>
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
              Never manually enter a receipt again.
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
