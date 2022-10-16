import { style, createTheme } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { MapLeafNodes } from '@vanilla-extract/private';

export const theme = createTheme({
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  underLimitValueColor: 'green',
  overLimitValueColor: 'red',
});
const [, vars] = theme;

export const root = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  fontSize: 24,
  lineHeight: '1em',
  fontFamily: 'Comic Sans MS',
  padding: 20,
  border: `1px solid ${vars.borderColor}`,
  backgroundColor: vars.backgroundColor,
});

export const count = recipe({
  variants: {
    overLimit: {
      true: { color: vars.overLimitValueColor },
      false: { color: vars.underLimitValueColor },
    },
  },
});

export const button = style({
  border: 'none',
  backgroundColor: 'white',
  borderRadius: '100%',
  cursor: 'pointer',
  fontSize: 24,
  display: 'block',
  width: 30,
  height: 30,
});
