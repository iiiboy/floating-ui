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
/**
 * *翻译：获取最近的祖先「定位」元素。处理一些边缘情况，例如表祖先和跨浏览器错误。
 *
 * *应该是用于获取元素，该元素用于 floating 作为标准进行定位。
 * */
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

  // *因为 offsetParent 可能是 static 定位的 body 元素，如果 offsetParent 不是包含块的话，那么就直接返回 window；所以就可以把这个 if 理解为：当 html 或 body 是 static 定位，并且不是包含块时，floating 元素应该相对于 window 定位
  // ?为什么要判断是不是包含块呢？issue 对应：https://github.com/floating-ui/floating-ui/issues/1375
  // ?为什么要相对于 window 定位呢？ issue 对应：https://github.com/floating-ui/floating-ui/pull/1148
  if (
    offsetParent &&// offsetParent 存在
    (getNodeName(offsetParent) === 'html' ||// offsetParent 是 html
      (getNodeName(offsetParent) === 'body' && // offsetParent 是 body
        getComputedStyle(offsetParent).position === 'static' &&// offsetParent 是 static 定位
        !isContainingBlock(offsetParent)))// *offsetParent 不是包含块  不是说元素只有在 absolute 或 fixed 定位情况下才可以判断包含块吗？为什么这里可以直接判断 offsetParent 呢？因为这里的 element 是指 floating 浮动元素，它必然是 absolute 或 fixed 定位，所以就可以判断这个 offsetParent 是否是 element 的包含块
  ) {
    return window;
  }

  // *否则就返回这里；
  return offsetParent || getContainingBlock(element) || window;
}
