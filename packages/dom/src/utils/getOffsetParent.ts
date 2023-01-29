import {getComputedStyle} from './getComputedStyle';
import {getNodeName} from './getNodeName';
import {getParentNode} from './getParentNode';
import {
  isContainingBlock,
  isHTMLElement,
  isLastTraversableNode,
  isTableElement,
} from './is';
import {getWindow} from './window';

/**
 * *获取 element.offsetParent; 如果 element 不是 HTMLElement 或者是 fixed 定位，那么返回 null
 *
 * *element.offsetParent 是指层级上的最近的定位元素(除 static 之外都算)或 table, td, th, body；
 *
 * *mdn 关于 offsetParent 的解释：https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetParent
 * */
function getTrueOffsetParent(element: Element): Element | null {
  if (
    !isHTMLElement(element) ||
    getComputedStyle(element).position === 'fixed'
  ) {
    return null;
  }

  return element.offsetParent;
}

function getContainingBlock(element: Element) {
  let currentNode: Node | null = getParentNode(element);

  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else {
      currentNode = getParentNode(currentNode);
    }
  }

  return null;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
export function getOffsetParent(element: Element): Element | Window {
  const window = getWindow(element);

  // *获取 offsetParent
  let offsetParent = getTrueOffsetParent(element);

  // *循环判断，如果 offsetParent 是 table 元素(table, td, th) 并且还是 static 定位，那么将继续向上寻找 offsetParent；
  // *因为 offsetParent 要不然是定位元素，要不然就是特殊元素；通过这个循环，让 offsetParent 只能是定位元素 或 body
  while (
    offsetParent &&
    isTableElement(offsetParent) &&
    getComputedStyle(offsetParent).position === 'static'
  ) {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (
    offsetParent &&
    (getNodeName(offsetParent) === 'html' ||
      (getNodeName(offsetParent) === 'body' &&
        getComputedStyle(offsetParent).position === 'static' &&
        !isContainingBlock(offsetParent)))
  ) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}
