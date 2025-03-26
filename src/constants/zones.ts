export const ZONES = [
  'zone1',
  'zone2',
  'zone3',
  'zone4',
  'zone5',
  'zone6',
  'zone7',
  'zone8',
  'zone9'
] as const;

export type Zone = typeof ZONES[number];