import type { Component } from 'solid-js';
import { CellState, Spot } from './utils.js';

const COLOR_MAP = {
  [Spot.None]: 'bg-gray-600',
  [Spot.Incorrect]: 'bg-yellow-600',
  [Spot.Correct]: 'bg-green-700',
} as const;

interface CellProps {
  state: CellState;
  setSpot: (newSpot: Spot) => void;
  setLetter: (newLetter: string) => void;
}

const Cell: Component<CellProps> = ({ state, setLetter, setSpot }) => (
  <div class="h-full w-full flex flex-col text-white group">
    <input
      type="text"
      maxLength="1"
      classList={{
        [COLOR_MAP[state.spot]]: true,
      }}
      class="outline-none w-full h-3/4 text-center font-bold text-3xl bg-opacity-75 group-hover:bg-opacity-100"
      value={state.letter}
      onInput={(e) => {
        if (e.inputType === 'deleteContentBackward') {
          setLetter('');
        } else if (e.data && /[a-z]/i.test(e.data)) {
          setLetter(e.data.toUpperCase());
        }
      }}
    />
    <div class="flex h-1/4 w-full divide-x divide-black items-center group">
      {[Spot.None, Spot.Incorrect, Spot.Correct].map((spot) => (
        <button
          aria-label={spot}
          type="button"
          classList={{
            [COLOR_MAP[spot]]: true,
            'border-t-0 group-hover:!bg-opacity-100': state.spot === spot,
            'border-t-[1px]': state.spot !== spot,
          }}
          class="h-full w-1/3 border-black bg-opacity-75 hover:bg-opacity-100"
          onClick={() => setSpot(spot)}
        />
      ))}
    </div>
  </div>
);
export default Cell;
