import { Dimensions, Platform } from 'react-native';

const window = Dimensions.get('window');

/** True when window width > height. */
export const isLandscape = window.width > window.height;

/** Logical width (horizontal in portrait). */
export const width = isLandscape ? window.height : window.width;
/** Logical height (vertical in portrait). */
export const height = isLandscape ? window.width : window.height;

export const isIos = Platform.OS === 'ios';

/** Re-read window dimensions (e.g. after rotation). */
export function getWindowDimensions() {
  const w = Dimensions.get('window');
  const landscape = w.width > w.height;
  return {
    width: landscape ? w.height : w.width,
    height: landscape ? w.width : w.height,
    isLandscape: landscape,
  };
}
