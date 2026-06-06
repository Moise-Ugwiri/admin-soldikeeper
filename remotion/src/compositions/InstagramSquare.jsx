/**
 * Instagram Square — 1080×1080, 15s (450 frames @ 30fps)
 *
 * Clean, minimal, brand-forward. One message per beat.
 *
 * Scenes:
 *   0-90   Logo + tagline
 *   90-210 Key benefit trio
 *   210-360 Phone + stat callout
 *   360-450 CTA
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup, DashboardScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { DEFAULT_PROPS } from '../defaultProps.js';

const SCENE = { BRAND: 0, BENEFITS: 90, PHONE: 210, CTA: 360 };

export const InstagramSquare = ({ hook, subtitle, features, ctaText, ctaUrl, accentColor, theme, tone } = {}) => {
  const frame = useCurrentFrame();

  const _hook = hook || DEFAULT_PROPS.hook;
  const _subtitle = subtitle || DEFAULT_PROPS.subtitle;
  const _features = features || DEFAULT_PROPS.features;
  const _ctaText = ctaText || DEFAULT_PROPS.ctaText;
  const _ctaUrl = ctaUrl || DEFAULT_PROPS.ctaUrl;

  const scene = frame < SCENE.BENEFITS ? 'BRAND'
    : frame < SCENE.PHONE ? 'BENEFITS'
    : frame < SCENE.CTA ? 'PHONE'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1080, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.shortHook)} volume={0.65} />}
      <GradientBg variant="green" particleCount={4} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '60px 80px', gap: 32 }}>

        {scene === 'BRAND' && (
          <>
            <div style={{ ...scaleIn(sceneFrame, 0) }}>
              <Logo size={72} fontSize={68} center />
            </div>
            <div style={{ ...fadeUp(sceneFrame, 18), fontFamily: FONT.sans, fontSize: 42, color: BRAND.textMuted, textAlign: 'center', lineHeight: 1.4, fontWeight: FONT.weight.medium }}>
              {_hook}
            </div>
          </>
        )}

        {scene === 'BENEFITS' && (
          <>
            <div style={{ ...fadeUp(sceneFrame, 0), fontFamily: FONT.sans, fontSize: 48, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              Everything you need
            </div>
            {[
              { icon: '📸', text: _features[0] || 'AI Receipt Scanner', delay: 10 },
              { icon: '🎯', text: _features[1] || 'Smart Budgets', delay: 22 },
              { icon: '🤝', text: _features[2] || 'Split Bills Instantly', delay: 34 },
              { icon: '🤖', text: _features[3] || 'AI Financial Advisor', delay: 46 },
            ].map((item, i) => (
              <div key={i} style={{
                ...fadeUp(sceneFrame, item.delay),
                display: 'flex', alignItems: 'center', gap: 20,
                background: BRAND.surface,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '20px 32px',
                width: '100%',
                fontFamily: FONT.sans,
              }}>
                <span style={{ fontSize: 44 }}>{item.icon}</span>
                <span style={{ fontSize: 38, fontWeight: FONT.weight.semibold, color: BRAND.white }}>{item.text}</span>
              </div>
            ))}
          </>
        )}

        {scene === 'PHONE' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
            <div style={{ ...scaleIn(sceneFrame, 0) }}>
              <PhoneMockup width={260} height={520} scale={1}>
                <DashboardScreen scale={1} />
              </PhoneMockup>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { stat: '50K+', label: 'Transactions' },
                { stat: '98%', label: 'Accuracy' },
                { stat: '⭐ 4.9', label: 'Rating' },
              ].map((item, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, i * 14),
                  fontFamily: FONT.sans,
                  textAlign: 'center',
                  background: BRAND.surface,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: '16px 28px',
                }}>
                  <div style={{ fontSize: 48, fontWeight: FONT.weight.black, color: BRAND.greenLight }}>{item.stat}</div>
                  <div style={{ fontSize: 24, color: BRAND.textMuted }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene === 'CTA' && (
          <>
            <div style={{ ...scaleIn(sceneFrame, 0) }}>
              <Logo size={60} fontSize={56} center />
            </div>
            <div style={{ ...fadeUp(sceneFrame, 16), fontFamily: FONT.sans, fontSize: 52, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              Free to download 🎉
            </div>
            <div style={{ ...scaleIn(sceneFrame, 28), background: BRAND.btnGreen, borderRadius: 50, padding: '22px 60px' }}>
              <span style={{ fontFamily: FONT.sans, fontSize: 38, fontWeight: FONT.weight.bold, color: BRAND.white }}>
                {_ctaText}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
