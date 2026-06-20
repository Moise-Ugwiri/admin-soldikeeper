import { DEFAULT_PROPS } from './defaultProps.js';
import { BRAND } from './theme.js';

const THEME_VARIANTS = new Set(['green', 'main', 'blue', 'violet', 'amber']);

export function resolveBrandProps(props = {}) {
  const hook = props.hook || DEFAULT_PROPS.hook;
  const subtitle = props.subtitle || DEFAULT_PROPS.subtitle;
  const features = props.features || DEFAULT_PROPS.features;
  const ctaText = props.ctaText || DEFAULT_PROPS.ctaText;
  const ctaUrl = props.ctaUrl || DEFAULT_PROPS.ctaUrl;
  const accentColor = props.accentColor || DEFAULT_PROPS.accentColor;
  const theme = props.theme || DEFAULT_PROPS.theme;
  const tone = props.tone || DEFAULT_PROPS.tone;
  const screenshots = props.screenshots || DEFAULT_PROPS.screenshots || [];

  const themeVariant = THEME_VARIANTS.has(theme) ? theme : 'green';

  return {
    hook,
    subtitle,
    features,
    ctaText,
    ctaUrl,
    accentColor,
    theme,
    tone,
    screenshots,
    themeVariant,
    accentMuted: `${accentColor}26`,
    accentBorder: `${accentColor}66`,
    ctaBg: accentColor,
    ctaTextColor: BRAND.white,
  };
}

/** Energetic = snappier animations; calm = slower reveals */
export function toneDelay(baseDelay, tone = 'energetic') {
  if (tone === 'calm' || tone === 'professional') return Math.round(baseDelay * 1.35);
  if (tone === 'energetic' || tone === 'bold') return Math.round(baseDelay * 0.75);
  return baseDelay;
}

export function screenshotForSlot(screenshots, slot) {
  return screenshots?.find((s) => s.slot === slot) || null;
}