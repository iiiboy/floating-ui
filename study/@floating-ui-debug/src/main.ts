import {computePosition, autoUpdate, flip} from '@floating-ui/dom';

const btn = document.getElementById('button');
const tooltip = document.getElementById('tooltip');

function updatePosition() {
  computePosition(btn!, tooltip!, {
    strategy: 'fixed',
    middleware: [flip({
    })]
  }).then(({x, y}) => {
    Object.assign(tooltip!.style, {
      top: `${y}px`,
      left: `${x}px`
    });
  });
}

let cleanup = null;

if (btn && tooltip)
  cleanup = autoUpdate(btn, tooltip, updatePosition);