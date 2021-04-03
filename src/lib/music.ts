const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const modes = ['minor', 'major']

export const getKey = (
  pitchClassKey: number,
  mode: number
): string => `${keys[pitchClassKey]} ${modes[mode]}`
