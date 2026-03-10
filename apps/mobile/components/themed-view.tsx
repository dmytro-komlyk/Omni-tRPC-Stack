import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { ...(lightColor && { light: lightColor }), ...(darkColor && { dark: darkColor }) },
    'background'
  );

  return (
    <View style={[{ backgroundColor }, style]} {...(className && { className })} {...otherProps} />
  );
}
