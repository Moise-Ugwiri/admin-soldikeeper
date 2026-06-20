import React from 'react';
import { BRAND, FONT } from '../theme.js';
import { ScreenshotSlot } from './ScreenshotSlot.jsx';
import { screenshotForSlot } from '../brandUtils.js';

/** Phone mockup with dark screen — children render as screen content */
export const PhoneMockup = ({ children, width = 300, height = 590, scale = 1 }) => {
  const borderRadius = 40 * scale;
  const border = 12 * scale;

  return (
    <div style={{
      position: 'relative',
      width: width * scale,
      height: height * scale,
      background: '#1a1a2e',
      borderRadius,
      border: `${border}px solid #2d2d4e`,
      boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)`,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute', top: 14 * scale, left: '50%',
        transform: 'translateX(-50%)',
        width: 90 * scale, height: 20 * scale,
        background: '#0a0a1a',
        borderRadius: 14 * scale,
        zIndex: 10,
      }} />

      {/* Screen */}
      <div style={{
        position: 'absolute', inset: 0,
        background: BRAND.dark,
        overflow: 'hidden',
      }}>
        {children}
      </div>

      {/* Screen reflection */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 10 * scale, left: '50%',
        transform: 'translateX(-50%)',
        width: 100 * scale, height: 4 * scale,
        background: 'rgba(255,255,255,0.35)',
        borderRadius: 4 * scale,
      }} />
    </div>
  );
};

/** Phone screen: uploaded screenshot or fallback dashboard mock */
export const PhoneScreen = ({ screenshots, scale = 1 }) => {
  const shot = screenshotForSlot(screenshots, 'phoneScreen');
  if (shot?.url) {
    return <ScreenshotSlot url={shot.url} />;
  }
  return <DashboardScreen scale={scale} />;
};

/** App screen mock — dashboard inside phone */
export const DashboardScreen = ({ scale = 1 }) => {
  const items = [
    { label: 'Groceries',   amount: '-€82.40',  bar: 68, color: BRAND.blue },
    { label: 'Transport',   amount: '-€34.00',  bar: 28, color: BRAND.violet },
    { label: 'Dining',      amount: '-€51.20',  bar: 42, color: BRAND.amber },
    { label: 'Savings',     amount: '+€200.00', bar: 100, color: BRAND.green },
  ];

  return (
    <div style={{
      padding: `${40 * scale}px ${16 * scale}px ${16 * scale}px`,
      fontFamily: FONT.sans,
      color: BRAND.white,
      height: '100%',
      display: 'flex', flexDirection: 'column', gap: 12 * scale,
    }}>
      {/* Balance hero */}
      <div style={{ textAlign: 'center', marginBottom: 4 * scale }}>
        <p style={{ margin: 0, fontSize: 11 * scale, color: BRAND.textMuted, fontWeight: 500 }}>Total Balance</p>
        <p style={{ margin: 0, fontSize: 30 * scale, fontWeight: 900, letterSpacing: -0.5 }}>€4,281.50</p>
        <p style={{ margin: 0, fontSize: 10 * scale, color: BRAND.green, fontWeight: 600 }}>↑ €320 this month</p>
      </div>

      {/* Category bars */}
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
          <span style={{ fontSize: 9 * scale, color: BRAND.textMuted, width: 56 * scale, flexShrink: 0 }}>{item.label}</span>
          <div style={{ flex: 1, height: 5 * scale, background: 'rgba(255,255,255,0.1)', borderRadius: 3 * scale, overflow: 'hidden' }}>
            <div style={{ width: `${item.bar}%`, height: '100%', background: item.color, borderRadius: 3 * scale }} />
          </div>
          <span style={{ fontSize: 9 * scale, fontWeight: 700, color: item.amount.startsWith('+') ? BRAND.green : BRAND.white, width: 52 * scale, textAlign: 'right', flexShrink: 0 }}>{item.amount}</span>
        </div>
      ))}

      {/* AI insight pill */}
      <div style={{
        marginTop: 'auto',
        background: `rgba(16,185,129,0.15)`,
        border: `1px solid rgba(16,185,129,0.3)`,
        borderRadius: 10 * scale,
        padding: `${8 * scale}px ${10 * scale}px`,
        display: 'flex', gap: 6 * scale, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 12 * scale }}>🤖</span>
        <p style={{ margin: 0, fontSize: 8.5 * scale, color: BRAND.textMuted, lineHeight: 1.4 }}>
          You're on track to save €320 this month — <span style={{ color: BRAND.greenLight, fontWeight: 600 }}>+12% vs last month</span>
        </p>
      </div>
    </div>
  );
};
