/**
 * Constants used to render the text block on the Loading-to-Container page.
 *
 * These mirror the values the Data Engineer team pastes into their trained
 * model. Only `m`, `l`, `w`, `h` are derived from the packing list itself;
 * the rest are fixed. Tweak them here — do not edit the page.
 */

export interface LoadingConstants {
  M: number;
  v: number[];
  L: number;
  W: number;
  H: number;
  X0: number;
  Y0: number;
  Z0: number;
}

export const LOADING_CONSTANTS: LoadingConstants = {
  M: 10000,
  v: [10, 8, 15, 6, 12, 9],
  L: 10,
  W: 6,
  H: 5,
  X0: 0,
  Y0: 0,
  Z0: 0,
};
