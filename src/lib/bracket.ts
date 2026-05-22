// Shared types and slot helpers for the bracket UI.
// Mirrors the server's bracket-scoring slot naming.

export type BracketRound = 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third';

export interface BracketSlot {
  id: string;          // e.g. "r32_1", "final"
  round: BracketRound;
  label: string;       // Hebrew, e.g. "1/16 גמר · משחק 1"
}

const ROUND_LABEL_HE: Record<BracketRound, string> = {
  r32: '1/16 גמר',
  r16: '1/8 גמר',
  qf: 'רבע הגמר',
  sf: 'חצי הגמר',
  final: 'הגמר',
  third: 'משחק על המקום השלישי',
};

export const ROUND_TAB_LABEL_HE: Record<BracketRound, string> = {
  r32: 'שמינית',
  r16: 'שמיניות',
  qf: 'רבע',
  sf: 'חצי',
  final: 'גמר',
  third: 'שלישי',
};

export const ROUNDS_IN_ORDER: BracketRound[] = ['r32', 'r16', 'qf', 'sf', 'final', 'third'];

export const SLOTS_PER_ROUND: Record<BracketRound, number> = {
  r32: 16,
  r16: 8,
  qf: 4,
  sf: 2,
  final: 1,
  third: 1,
};

export function buildSlots(): BracketSlot[] {
  const out: BracketSlot[] = [];
  for (const round of ROUNDS_IN_ORDER) {
    const count = SLOTS_PER_ROUND[round];
    for (let i = 1; i <= count; i++) {
      const id = count === 1 ? round : `${round}_${i}`;
      const label = count === 1 ? ROUND_LABEL_HE[round] : `${ROUND_LABEL_HE[round]} · משחק ${i}`;
      out.push({ id, round, label });
    }
  }
  return out;
}

export function slotsByRound(): Record<BracketRound, BracketSlot[]> {
  const map = {} as Record<BracketRound, BracketSlot[]>;
  for (const round of ROUNDS_IN_ORDER) map[round] = [];
  for (const slot of buildSlots()) map[slot.round].push(slot);
  return map;
}
