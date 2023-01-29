import type {ClientRectObject, VirtualElement} from '@floating-ui/core';

import {FALLBACK_SCALE, getScale} from './getScale';
import {isElement, isLayoutViewport} from './is';
import {unwrapElement} from './unwrapElement';
import {getWindow} from './window';

/**
 * *该函数的作用与 getBoundingRectClient 差不多，都是返回一个 ClientRectObject，但是函数内处理了一些情况，比如缩放，比如 iframe；因为我暂时没有遇到这样的情况，所以暂时没有理解
 *
 * *如果没有上述的特殊情况，就可以看作是 getBoundingRectClient
 **/
export function getBoundingClientRect(
  element: Element | VirtualElement,
  includeScale = false,
  isFixedStrategy = false,
  offsetParent?: Element | Window
): ClientRectObject {
  const clientRect = element.getBoundingClientRect();
  // 获取真实的 domElement
  const domElement = unwrapElement(element);

  let scale = FALLBACK_SCALE;
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }

  const win = domElement ? getWindow(domElement) : window;
  const addVisualOffsets = !isLayoutViewport() && isFixedStrategy;// ?不明白

  let x =
    (clientRect.left +
      (addVisualOffsets ? win.visualViewport?.offsetLeft || 0 : 0)) /
    scale.x;
  let y =
    (clientRect.top +
      (addVisualOffsets ? win.visualViewport?.offsetTop || 0 : 0)) /
    scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;

  if (domElement) {
    const win = getWindow(domElement);
    // *为了更好的支持 iframe，比如 reference 在 iframe 中，但是 floating 在 iframe 外的情况； 具体的 pull-reques
    const offsetWin =
      offsetParent && isElement(offsetParent)
        ? getWindow(offsetParent)
        : offsetParent;

    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);

      iframeRect.x +=
        (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) *
        iframeScale.x;
      iframeRect.y +=
        (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;

      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;

      x += iframeRect.x;
      y += iframeRect.y;

      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }

  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y,
  };
}
