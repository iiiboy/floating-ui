import type {Dimensions} from '@floating-ui/core';

import {getComputedStyle} from './getComputedStyle';
import {round} from './math';

// 对应的 issue：https://github.com/floating-ui/floating-ui/pull/2056
/**
 * *获取计算后真实的 width 和 height；
 *
 * *width height 不能直接使用 offsetWidth/offsetHeight 因为 offsetWidth/offsetHeight 是直接四舍五入的，可能不准确。
 *
 * *也不能直接使用 ComputedStyle.width/height 因为，width/height 的值可能为 auto
 *
 * *所以就需要通过计算，优先使用 ComputedStyle.width/height，其次使用 offsetWidth/offsetHeight; 然后为了进行区分，加入了 shouldFallback 进行区分，如果 shouldFallback 为 true 说明使用的是 offsetWidth/offsetHeight
 * */
export function getCssDimensions(
  element: HTMLElement
): Dimensions & {fallback: boolean} {
  const css = getComputedStyle(element);
  let width = parseFloat(css.width);
  let height = parseFloat(css.height);
  const offsetWidth = element.offsetWidth;
  const offsetHeight = element.offsetHeight;
  const shouldFallback =
    round(width) !== offsetWidth || round(height) !== offsetHeight;

  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }

  return {
    width,
    height,
    fallback: shouldFallback,
  };
}
