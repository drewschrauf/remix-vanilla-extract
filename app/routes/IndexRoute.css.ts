import { style } from '@vanilla-extract/css';
import { font } from '~/common/Common.css';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
});

export const heading = style({
  fontSize: 24,
  fontFamily: font,
});
