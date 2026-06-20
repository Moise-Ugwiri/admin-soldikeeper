import React from 'react';
import { Img } from 'remotion';

/** Renders a remote or static screenshot inside a composition frame */
export const ScreenshotSlot = ({ url, style = {} }) => {
  if (!url) return null;
  return (
    <Img
      src={url}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
    />
  );
};