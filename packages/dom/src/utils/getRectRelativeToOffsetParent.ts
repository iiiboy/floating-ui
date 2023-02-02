import type {Rect, Strategy, VirtualElement} from '@floating-ui/core';

import {getBoundingClientRect} from './getBoundingClientRect';
import {getDocumentElement} from './getDocumentElement';
import {getNodeName} from './getNodeName';
import {getNodeScroll} from './getNodeScroll';
import {getWindowScrollBarX} from './getWindowScrollBarX';
import {isHTMLElement, isOverflowElement} from './is';

/**
 * *获取 element 相对于 offsetParent 内容的位置；因为是获取相对于「内容」的位置，所以要计算 border 的影响；然后还有 滚动的影响
 *
 * @example 假设 element 的位置在 { x: 500, y: 600 }；offsetParent 的位置在 { x: 300, y: 700 } 那么返回的结果中的部分为： { x: 200, y: -100 }
 * @example 假设 element 的位置在 { x: 500, y: 600}; offsetParent 的位置在 { x: 300, y: 700 } 但是 offsetParent 还有一个 10px 的 border 那么返回的结果中的 x, y 为: { x: 190, -110 }
 * */
export function getRectRelativeToOffsetParent(
  element: Element | VirtualElement,
  offsetParent: Element | Window,
  strategy: Strategy
): Rect {

  // *判断是不是 HTMLElement 通过 `? instanceof window.HTMLElement` 判断; html body 都是 true， window 为 false
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const rect = getBoundingClientRect(// 没有特殊情况时可以粗略看作原生的 getBoundingRectClient
    element,
    true,
    strategy === 'fixed',
    offsetParent
  );

  let scroll = {scrollLeft: 0, scrollTop: 0};
  const offsets = {x: 0, y: 0};

  if (
    isOffsetParentAnElement ||
    strategy !== 'fixed'
  ) {
    if (
      getNodeName(offsetParent) !== 'body' ||
      isOverflowElement(documentElement)
    ) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent, true);
      offsets.x = offsetRect.x + offsetParent.clientLeft;// *clientLeft 可以看作左边框的大小
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height,
  };
}
