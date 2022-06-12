import { Component, createMemo, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import Cell from './Cell.jsx';
import { arrayWithLength, CellState, processList, Spot } from './utils.js';
import { SOLUTIONS, NON_SOLUTIONS } from './words.js';

const App: Component = () => {
  const [cellStates, setCellStates] = createStore(
    arrayWithLength(6, () =>
      arrayWithLength(
        5,
        () =>
          ({
            spot: Spot.None,
            letter: '',
          } as CellState),
      ),
    ),
  );

  const suggestions = createMemo(
    () =>
      [
        ['Solutions', processList(SOLUTIONS, cellStates).slice(0, 10)],
        ['Guesses', processList(NON_SOLUTIONS, cellStates).slice(0, 10)],
      ] as const,
  );

  return (
    <div class="h-full flex items-center justify-center my-5">
      <div class="space-y-10">
        <h1 class="text-3xl w-full text-center">Wordle Helper</h1>
        <div class="space-y-2">
          <For each={cellStates}>
            {(row, i) => (
              <div class="flex space-x-1">
                <For each={row}>
                  {(cell, j) => (
                    <div class="flex space-x-1">
                      <div class="w-20 h-20 border-2 border-black rounded overflow-hidden">
                        <Cell
                          state={cell}
                          setLetter={(letter) =>
                            setCellStates(i(), j(), 'letter', letter)
                          }
                          setSpot={(spot) =>
                            setCellStates(i(), j(), 'spot', spot)
                          }
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
        <div class="w-full flex justify-between min-h-[17rem]">
          {suggestions().map(([word, list]) => (
            <div>
              <span class="text-xl">Top {word}:</span>
              <ol>
                {list.map((w, i) => (
                  <li>
                    {i + 1}. {w}
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

export default App;
