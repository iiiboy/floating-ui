import type {Coords} from '@floating-ui/core';

import type {VirtualElement} from '../types';
import {getCssDimensions} from './getCssDimensions';
import {isHTMLElement} from './is';
import {round} from './math';
import {unwrapElement} from './unwrapElement';

export const FALLBACK_SCALE = {x: 1, y: 1};

export function getScale(element: Element | VirtualElement): Coords {
  const domElement = unwrapElement(element);

  if (!isHTMLElement(domElement)) {
    return FALLBACK_SCALE;
  }

  const rect = domElement.getBoundingClientRect();
  const {width, height, fallback} = getCssDimensions(domElement);
  // ?为什么使用计算来获得 scale 而不是直接取 transform.scale 呢？
  // !使用过 transform.scale 进行缩放后， css.width, element.offsetWidth 并不会进行缩放，还是原来的值；只有 getBoundingClientRect().width 才会变成缩放后的值;
  // *公式 transform.scale = getBoundingClientRect().width / (css.width|element.offsetWidth);
  // *所以可知，这里根本不是计算 transform.scale；要结合 scale 的使用来说，在 getBoundingClientRect(@floating-ui 自定义的) 函数中，是 /(除以)scale 并不是 *(乘以)scale 的。
  // *还有一个原因，offsetWidth/offsetHeight 是四舍五入的，所以这里的计算值与 transform.scale 是不一样的，因为一直使用 offsetWidth/offsetHeight 进行计算，所以应该以 offsetWidth/offsetHeight 为准进行计算。
  // !最重要的原因：如果父元素设置了 scale，但是获取子元素的 transform 得到的只会是 none! 并且父元素获取到的 transform 的值为： matrix(0.8, 0, 0, 0.8, 0, 0) 对于不了解 matrix 的人根本不好获取具体的 scale
  let x = (fallback ? round(rect.width) : rect.width) / width;
  let y = (fallback ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }

  if (!y || !Number.isFinite(y)) {
    y = 1;
  }

  return {
    x,
    y,
  };
}
