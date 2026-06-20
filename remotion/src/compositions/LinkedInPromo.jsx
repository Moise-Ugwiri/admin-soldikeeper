/**
 * LinkedIn Professional Promo — 1920×1080, 45s (1350 frames @ 30fps)
 *
 * More formal, B2B angle. Focuses on productivity, teams, and professional finance management.
 *
 * Scenes:
 *   0-180   Professional hook
 *   180-420 Problem in workplace context
 *   420-720 Product overview (3 panels)
 *   720-1080 Use cases: teams & freelancers
 *   1080-1350 CTA with credibility markers
 */
import React from 'react';
import { useCurrentFrame, Audio, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg.jsx';
import { Logo } from '../components/Logo.jsx';
import { PhoneMockup, PhoneScreen } from '../components/PhoneMockup.jsx';
import { BRAND, FONT } from '../theme.js';
import { fadeUp, scaleIn, slideLeft, slideRight } from '../animations.js';
import { AUDIO_ENABLED, AUDIO } from '../audioConfig.js';
import { resolveBrandProps, toneDelay } from '../brandUtils.js';

const SCENE = { HOOK: 0, PROBLEM: 180, PRODUCT: 420, USECASES: 720, CTA: 1080 };

const CredentialBadge = ({ icon, text, frame, delay }) => (
  <div style={{
    ...fadeUp(frame, delay),
    display: 'inline-flex', alignItems: 'center', gap: 12,
    background: BRAND.surface,
    border: `1px solid rgba(16,185,129,0.3)`,
    borderRadius: 40,
    padding: '10px 24px',
    fontFamily: FONT.sans,
    fontSize: 24,
    color: BRAND.textMuted,
    fontWeight: FONT.weight.medium,
  }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    {text}
  </div>
);

export const LinkedInPromo = (props = {}) => {
  const frame = useCurrentFrame();
  const brand = resolveBrandProps(props);
  const { hook: _hook, subtitle: _subtitle, features: _features, ctaText: _ctaText, ctaUrl: _ctaUrl, accentColor, themeVariant, tone, screenshots } = brand;

  const scene = frame < SCENE.PROBLEM ? 'HOOK'
    : frame < SCENE.PRODUCT ? 'PROBLEM'
    : frame < SCENE.USECASES ? 'PRODUCT'
    : frame < SCENE.CTA ? 'USECASES'
    : 'CTA';

  const sceneFrame = frame - SCENE[scene];

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', overflow: 'hidden', background: BRAND.darkest }}>
      {AUDIO_ENABLED && <Audio src={staticFile(AUDIO.mainTheme)} volume={0.6} />}
      <GradientBg variant={themeVariant === 'green' ? 'main' : themeVariant} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 120px', gap: 80 }}>

        {scene === 'HOOK' && (
          <div style={{ textAlign: 'center', fontFamily: FONT.sans, maxWidth: 1300 }}>
            <div style={{ ...fadeUp(sceneFrame, 0), display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <CredentialBadge icon="🔐" text="Bank-level security" frame={sceneFrame} delay={0} />
              <CredentialBadge icon="🌍" text="20+ currencies" frame={sceneFrame} delay={8} />
              <CredentialBadge icon="📱" text="iOS & Android" frame={sceneFrame} delay={16} />
            </div>
            <h1 style={{ ...fadeUp(sceneFrame, 20), margin: '0 0 28px', fontSize: 80, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1, letterSpacing: -2 }}>
              {_hook}
            </h1>
            <p style={{ ...fadeUp(sceneFrame, 34), margin: 0, fontSize: 36, color: BRAND.textMuted, lineHeight: 1.5 }}>
              SoldiKeeper helps professionals and teams track spending, manage budgets, and split costs — effortlessly.
            </p>
          </div>
        )}

        {scene === 'PROBLEM' && (
          <div style={{ textAlign: 'center', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 48px', fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              Financial chaos costs <span style={{ color: BRAND.amber }}>real money.</span>
            </h2>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              {[
                { stat: '4h', label: 'Lost per month to expense admin', icon: '⏱️', delay: 0 },
                { stat: '34%', label: 'Budget overruns go unnoticed', icon: '📈', delay: 14 },
                { stat: '€280', label: 'Average monthly overspend', icon: '💸', delay: 28 },
              ].map((s, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, s.delay),
                  background: BRAND.surface,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  padding: '40px 44px',
                  minWidth: 280,
                  display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 56 }}>{s.icon}</span>
                  <span style={{ fontSize: 64, fontWeight: FONT.weight.black, color: BRAND.amber, lineHeight: 1 }}>{s.stat}</span>
                  <p style={{ margin: 0, fontSize: 22, color: BRAND.textMuted, textAlign: 'center', lineHeight: 1.3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene === 'PRODUCT' && (
          <div style={{ width: '100%', fontFamily: FONT.sans }}>
            <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 40px', fontSize: 56, fontWeight: FONT.weight.black, color: BRAND.white, textAlign: 'center' }}>
              Everything in one place
            </h2>
            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { icon: '📸', title: _features[0] || 'Receipt Scanner', desc: 'AI-powered OCR. Capture any receipt in under 3 seconds with 98% accuracy.', delay: 0 },
                { icon: '🎯', title: _features[1] || 'Smart Budgets', desc: 'Adaptive budgets with rollover logic, threshold alerts, and category insights.', delay: 16 },
                { icon: '🤝', title: _features[2] || 'Bill Splitting', desc: 'Shared expenses, debt simplification, instant settlement. No spreadsheets needed.', delay: 32 },
                { icon: '🤖', title: _features[3] || 'AI Financial Advisor', desc: 'Keeper AI answers finance questions and surfaces actionable insights daily.', delay: 48 },
              ].map((f, i) => (
                <div key={i} style={{
                  ...fadeUp(sceneFrame, f.delay),
                  flex: 1,
                  background: BRAND.surface,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <span style={{ fontSize: 52 }}>{f.icon}</span>
                  <span style={{ fontSize: 28, fontWeight: FONT.weight.bold, color: BRAND.white }}>{f.title}</span>
                  <p style={{ margin: 0, fontSize: 22, color: BRAND.textMuted, lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene === 'USECASES' && (
          <div style={{ display: 'flex', gap: 80, alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1, fontFamily: FONT.sans }}>
              <h2 style={{ ...fadeUp(sceneFrame, 0), margin: '0 0 36px', fontSize: 56, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
                Built for how<br /><span style={{ color: BRAND.greenLight }}>professionals live</span>
              </h2>
              {[
                { icon: '👔', role: 'Freelancers', desc: 'Track project expenses, invoice prep, tax-ready reports.', delay: 10 },
                { icon: '👨‍👩‍👧', role: 'Families', desc: "Shared budgets, kids' allowances, household bills split fairly.", delay: 22 },
                { icon: '✈️', role: 'Travellers', desc: 'Multi-currency, per-trip budgets, group hotel & dining splits.', delay: 34 },
                { icon: '🚀', role: 'Small teams', desc: 'Company expenses, reimbursements, project cost tracking.', delay: 46 },
              ].map((u, i) => (
                <div key={i} style={{ ...slideLeft(sceneFrame, u.delay, 50, 20), display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
                  <span style={{ fontSize: 40, flexShrink: 0, marginTop: 2 }}>{u.icon}</span>
                  <div>
                    <span style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: FONT.weight.bold, color: BRAND.white }}>{u.role} — </span>
                    <span style={{ fontFamily: FONT.sans, fontSize: 26, color: BRAND.textMuted }}>{u.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...slideRight(sceneFrame, 10, 80), flexShrink: 0 }}>
              <PhoneMockup width={280} height={560} scale={1.1}>
                <PhoneScreen screenshots={screenshots} scale={1.1} />
              </PhoneMockup>
            </div>
          </div>
        )}

        {scene === 'CTA' && (
          <div style={{ width: '100%', textAlign: 'center', fontFamily: FONT.sans }}>
            <div style={{ ...scaleIn(sceneFrame, 0), marginBottom: 28 }}>
              <Logo size={56} fontSize={52} center showTagline />
            </div>
            <h2 style={{ ...fadeUp(sceneFrame, 12), margin: '0 0 20px', fontSize: 72, fontWeight: FONT.weight.black, color: BRAND.white, lineHeight: 1.1 }}>
              Take control of your finances.<br /><span style={{ color: BRAND.greenLight }}>Starting today.</span>
            </h2>
            <div style={{ ...fadeUp(sceneFrame, 24), display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
              <CredentialBadge icon="🆓" text="Free plan available" frame={sceneFrame} delay={24} />
              <CredentialBadge icon="🔐" text="Bank-grade security" frame={sceneFrame} delay={32} />
              <CredentialBadge icon="⭐" text="4.9 App Store rating" frame={sceneFrame} delay={40} />
            </div>
            <div style={{ ...scaleIn(sceneFrame, toneDelay(50, tone)), display: 'inline-block', background: accentColor, borderRadius: 60, padding: '24px 72px' }}>
              <span style={{ fontSize: 42, fontWeight: FONT.weight.bold, color: BRAND.white }}>{_ctaText} — {_ctaUrl.replace('https://', '')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
