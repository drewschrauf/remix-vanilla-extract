import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { CSSVarFunction, MapLeafNodes } from '@vanilla-extract/private';
import clsx from 'clsx';

type ThemedProps<T> = {
  theme: [string, MapLeafNodes<T, CSSVarFunction>];
  vars: MapLeafNodes<MapLeafNodes<T, CSSVarFunction>, string>;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const Themed = <T extends {}>({
  theme,
  vars,
  className,
  ...props
}: ThemedProps<T>) => (
  <div
    {...props}
    className={clsx(className, theme[0])}
    style={assignInlineVars(theme[1], vars)}
  ></div>
);
