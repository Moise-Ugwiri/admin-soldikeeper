import React from 'react';
import { BRAND, FONT } from '../theme.js';

/** SoldiKeeper brand logo mark + wordmark */
export const Logo = ({ size = 56, fontSize = 48, showTagline = false, center = false }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: center ? 'center' : 'flex-start',
    gap: 10,
    fontFamily: FONT.sans,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Icon mark */}
      <div style={{
        width: size, height: size,
        background: BRAND.btnGreen,
        borderRadius: Math.round(size * 0.24),
        boxShadow: `0 0 ${size * 0.6}px ${BRAND.greenGlow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: size * 0.58, lineHeight: 1 }}>💰</span>
      </div>

      {/* Wordmark */}
      <span style={{
        fontSize,
        fontWeight: FONT.weight.black,
        color: BRAND.white,
        letterSpacing: -1.5,
        lineHeight: 1,
      }}>
        Soldi<span style={{ color: BRAND.greenLight }}>Keeper</span>
      </span>
    </div>

    {showTagline && (
      <p style={{
        margin: 0,
        color: BRAND.textMuted,
        fontSize: Math.round(fontSize * 0.38),
        fontWeight: FONT.weight.medium,
        letterSpacing: 0.5,
        paddingLeft: center ? 0 : size + 14,
      }}>
        Smart Money Management, Made Simple
      </p>
    )}
  </div>
);
