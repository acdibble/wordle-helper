import type { NextPage } from 'next';
import { useMemo, useState } from 'react';
import { SOLUTIONS, NON_SOLUTIONS } from '../lib/words';

const enum Spot {
  None,
  Incorrect,
  Correct,
}

interface CellState {
  spot: Spot;
  letter: string;
}

type RowNumber = 1 | 2 | 3 | 4 | 5 | 6;
type ColNumber = 1 | 2 | 3 | 4 | 5;

type CellKey = `${RowNumber}-${ColNumber}`;
type CellStateMap = { [K in CellKey]: CellState };

interface CellProps {
  state: CellState;
  setSpot: (newSpot: Spot) => void;
  setLetter: (newLetter: string) => void;
}

function Cell({ state, setLetter, setSpot }: CellProps): JSX.Element {
  let bgColor = 'bg-gray-600/75';

  if (state.spot === Spot.Incorrect) {
    bgColor = 'bg-yellow-600/75';
  } else if (state.spot === Spot.Correct) {
    bgColor = 'bg-green-700/75';
  }

  return (
    <div className="h-full w-full flex text-white">
      <input
        type="text"
        className={`outline-none w-full h-full text-center ${bgColor} font-bold text-3xl`}
        value={state.letter}
        onChange={(e) => {
          if (e.target.value === '' || /^[a-z]$/i.test(e.target.value)) {
            setLetter(e.target.value.toUpperCase());
          }
        }}
      />
      <div className="flex flex-col w-1/3 divide-y divide-black">
        {(
          [
            ['bg-gray-600/75', Spot.None],
            ['bg-yellow-600/75', Spot.Incorrect],
            ['bg-green-700/75', Spot.Correct],
          ] as const
        ).map(([bg, spot]) => (
          <button
            key={bg}
            type="button"
            className={`${bg} h-1/3 ${
              state.spot === spot ? '' : 'border-l-[1px] border-black'
            }`}
            onClick={() => setSpot(spot)}
          >
            {' '}
          </button>
        ))}
      </div>
    </div>
  );
}

type WeightCount = { [letter: string]: number };

const getWordWeights = (
  words: string[],
): [WeightCount, WeightCount, WeightCount, WeightCount, WeightCount] =>
  words.reduce(
    (acc, w) => {
      for (let i = 0; i < w.length; i += 1) {
        const ch = w[i];
        acc[i][ch] ??= 0;
        acc[i][ch] += 1;
      }
      return acc;
    },
    [{}, {}, {}, {}, {}] as [
      WeightCount,
      WeightCount,
      WeightCount,
      WeightCount,
      WeightCount,
    ],
  );

const processList = (words: string[], cellStates?: CellStateMap): string[] => {
  let filtered = words;

  const misses: string[] = [];
  const incorrects: string[][] = [[], [], [], [], []];
  const corrects: string[] = ['.', '.', '.', '.', '.'];

  if (cellStates) {
    const states = Object.entries(cellStates)
      .filter(([, state]) => state.letter !== '')
      .map(([key, state]) => ({
        ...state,
        index: Number(key.split('-')[1]),
      }));

    for (const { index, spot, letter } of states) {
      if (spot === Spot.None) {
        misses.push(letter);
      } else if (spot === Spot.Incorrect) {
        incorrects[index].push(letter);
      } else if (spot === Spot.Correct) {
        corrects[index] = letter;
      }
    }

    const missRegExp = new RegExp(`[${misses.join('')}]`, 'i');
    const incorrectRegExp = new RegExp(
      incorrects
        .map((arr) => (arr.length === 0 ? '.' : `[^${arr.join('')}]`))
        .join(''),
      'i',
    );
    const includesRegExp = new RegExp(
      `${
        incorrects
          .flat()
          .map((ch) => `(?=.*${ch})`)
          .join('') || '\\w'
      }`,
      'i',
    );
    const correctRegExp = new RegExp(corrects.join(''), 'i');

    filtered = words.filter(
      (w) =>
        correctRegExp.test(w) &&
        includesRegExp.test(w) &&
        !missRegExp.test(w) &&
        incorrectRegExp.test(w),
    );
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

const Home: NextPage = () => {
  const [cellStates, setCellStates] = useState(
    Object.fromEntries(
      Array.from({ length: 6 }, (_, i) =>
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Array.from({ length: 5 }, (_, j) => [
          `${i}-${j}` as CellKey,
          {
            spot: Spot.None,
            letter: '',
          } as CellState,
        ]),
      ).flat(),
    ) as CellStateMap,
  );

  const handleChange =
    <F extends keyof CellState>(key: CellKey, field: F) =>
    (newValue: CellState[F]) => {
      setCellStates((previous) => ({
        ...previous,
        [key]: {
          ...previous[key],
          [field]: newValue,
        },
      }));
    };

  const availableSolutions = useMemo(
    () => processList(SOLUTIONS, cellStates),
    [cellStates],
  );

  const availableGuesses = useMemo(
    () => processList(NON_SOLUTIONS, cellStates),
    [cellStates],
  );

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-10">
        <h1 className="text-3xl w-full text-center">Wordle Helper</h1>
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`row-${i}`} className="flex space-x-1">
              {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
              {Array.from({ length: 5 }, (_, j) => {
                const key = `${i as RowNumber}-${j as ColNumber}` as const;
                return (
                  <div
                    className="w-20 h-20 border-2 border-black rounded overflow-hidden"
                    key={key}
                  >
                    <Cell
                      state={cellStates[key]}
                      key={`${i}-${j}`}
                      setLetter={handleChange(key, 'letter')}
                      setSpot={handleChange(key, 'spot')}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="w-full flex justify-between">
          {(
            [
              ['Solutions', availableSolutions],
              ['Guesses', availableGuesses],
            ] as const
          ).map(([word, list]) => (
            <div key={word}>
              <span className="text-xl">Top {word}:</span>
              <ol>
                {[...list.slice(0, 10), ...' '.repeat(10)]
                  .slice(0, 10)
                  .filter(Boolean)
                  .map((w, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={`${w}-${i}`}>
                      {w === ' ' ? (
                        <>&nbsp;</>
                      ) : (
                        <>
                          {i + 1}. {w}
                        </>
                      )}
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
