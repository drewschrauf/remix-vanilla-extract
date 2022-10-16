import { style, createTheme } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { MapLeafNodes } from '@vanilla-extract/private';

export const theme = createTheme({
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  underlimitValueColor: 'green',
  overlimitValueColor: 'red',
});

export const root = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  fontSize: 24,
  lineHeight: '1em',
  fontFamily: 'Comic Sans MS',
  padding: 20,
  border: `1px solid ${theme[1].borderColor}`,
  backgroundColor: theme[1].backgroundColor,
});

export const count = recipe({
  variants: {
    overlimit: {
      true: { color: theme[1].overlimitValueColor },
      false: { color: theme[1].underlimitValueColor },
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
