export type LineId =
  | '1' | '2' | '3'
  | '4' | '5' | '6' | '6X'
  | '7' | '7X'
  | 'A' | 'C' | 'E'
  | 'B' | 'D' | 'F' | 'FX' | 'M'
  | 'G'
  | 'J' | 'Z'
  | 'L'
  | 'N' | 'Q' | 'R' | 'W'
  | 'S' | 'SIR'

export interface Stop {
  id: string
  name: string
  aliases: string[]
  coordinates: [number, number]  // [lng, lat]
  lines: LineId[]
}

export interface Toast {
  id: string
  stop: Stop
  fading?: boolean
}

export type MapStyleId = 'streets' | 'schematic'
