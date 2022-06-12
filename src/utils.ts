declare global {
  type ArrayOf<L extends number, U, T extends U[] = []> = T extends {
    length: L;
  }
    ? T
    : ArrayOf<L, U, [...T, U]>;
}

export const arrayWithLength = <T extends number, U>(
  length: T,
  cb: (index: number) => U,
) => Array.from({ length }, (_, index) => cb(index)) as ArrayOf<T, U>;

export const enum Spot {
  None = 'None',
  Incorrect = 'Incorrect',
  Correct = 'Correct',
}

export interface CellState {
  spot: Spot;
  letter: string;
}

export type StateRow = ArrayOf<5, CellState>;
export type StateMatrix = ArrayOf<6, StateRow>;

const getWordWeights = (words: string[]) =>
  words.reduce(
    (acc, w) => {
      for (let i = 0; i < w.length; i += 1) {
        const ch = w[i];
        acc[i][ch] ??= 0;
        acc[i][ch] += 1;
      }
      return acc;
    },
    arrayWithLength(5, () => ({} as Record<string, number>)),
  );

export const processList = (
  words: string[],
  cellStates?: StateMatrix,
): string[] => {
  let filtered = words;

  const misses = new Set<string>();

  const possibilities: (string | string[])[] = [[], [], [], [], []];

  if (cellStates) {
    const states = cellStates
      .flatMap((row) => row.map((state, j) => [j, state] as const))
      .filter(([, state]) => state.letter !== '')
      .map(([index, state]) => ({ ...state, index }));

    for (const { index, spot, letter } of states) {
      if (spot === Spot.None) {
        misses.add(letter);
      } else if (spot === Spot.Incorrect) {
        const poss = possibilities[index];
        if (Array.isArray(poss)) poss.push(letter);
      } else if (spot === Spot.Correct) {
        possibilities[index] = letter;
      }
    }

    const re = new RegExp(
      (misses.size !== 0 ? `(?!.*[${[...misses].join('')}])` : '') +
        possibilities
          .flatMap((p) =>
            typeof p === 'string' ? '' : p.map((ch) => `(?=.*${ch})`),
          )
          .join('') +
        possibilities
          .map((p) =>
            // eslint-disable-next-line no-nested-ternary
            typeof p === 'string'
              ? p
              : p.length === 0
              ? '.'
              : `[^${p.join('')}]`,
          )
          .join(''),
      'i',
    );

    filtered = words.filter((w) => re.test(w));
  }

  const freqCounts = getWordWeights(filtered);

  return filtered
    .map((word) => ({
      word,
      weight: [...word].reduce((acc, ch, i) => {
        let letterWeight = freqCounts[i][ch];
        if (word.indexOf(ch) !== i) letterWeight /= 8;
        return acc + letterWeight;
      }, 0),
    }))
    .sort((a, b) => b.weight - a.weight)
    .map((a) => a.word);
};
