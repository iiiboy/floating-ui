import type {Coords, ElementRects, Placement} from './types';
import {getAlignment} from './utils/getAlignment';
import {getLengthFromAxis} from './utils/getLengthFromAxis';
import {getMainAxisFromPlacement} from './utils/getMainAxisFromPlacement';
import {getSide} from './utils/getSide';

/**
 * *通过 placement 计算 floating 的具体位置
 * */
export function computeCoordsFromPlacement(
  {reference, floating}: ElementRects,
  placement: Placement,
  rtl?: boolean
): Coords {
  const commonX = reference.x + reference.width / 2 - floating.width / 2;// 其实很好理解：reference 宽度为 200, floating 宽度为 100; 那么 (reference.width / 2 - floating.width / 2) = 50 刚好是 floating 居中的位置
  const commonY = reference.y + reference.height / 2 - floating.height / 2;// 同上， y 轴居中的位置
  const mainAxis = getMainAxisFromPlacement(placement);// 当 placement 为 top, bottom 时，返回 x, 不然就返回 y; 其实很好理解，因为 placement 分为两个部分，比如 bottom-start 就是 [bottom, start]，而这个变量，就是为了处理第二部分的值，所以 bottom 为什么得到 x 就理解了吧？因为要处理 start | end
  const length = getLengthFromAxis(mainAxis);// 如果是 x 就返回 width 如果是 y 就返回 height. 同上
  const commonAlign = reference[length] / 2 - floating[length] / 2;// 计算居中的位置
  const side = getSide(placement);
  const isVertical = mainAxis === 'x';

  let coords;
  switch (side) {
    case 'top':
      coords = {x: commonX, y: reference.y - floating.height};
      break;
    case 'bottom':
      coords = {x: commonX, y: reference.y + reference.height};
      break;
    case 'right':
      coords = {x: reference.x + reference.width, y: commonY};
      break;
    case 'left':
      coords = {x: reference.x - floating.width, y: commonY};
      break;
    default:
      coords = {x: reference.x, y: reference.y};
  }

  switch (getAlignment(placement)) {
    case 'start':
      coords[mainAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[mainAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    default:
  }

  return coords;
}
