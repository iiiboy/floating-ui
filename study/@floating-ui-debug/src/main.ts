import './style.css';
import './static/floating.css';
import {computePosition, autoUpdate} from '@floating-ui/dom';

const btn = document.getElementById('button');
const tooltip = document.getElementById('tooltip');

function updatePosition() {
  computePosition(btn!, tooltip!, {}).then(({x, y}) => {
    Object.assign(tooltip!.style, {
      top: `${y}px`,
      left: `${x}px`
    });
  });
}

let cleanup = null;

if (btn && tooltip)
  cleanup = autoUpdate(btn, tooltip, updatePosition);