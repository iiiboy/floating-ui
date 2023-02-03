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
 * *获取 element.offsetParent; 如果 element 不是 HTMLElement 或者是 fixed 定位，那么返回 null，display 为 none 也会返回 null
 *
 * *element.offsetParent 是指层级上的最近的定位元素(除 static 之外都算)或 table, td, th, body, 还有可能是 html，好像 firefox 某个版本会将 html 作为 offsetParent 进行返回? 在 @floating-ui 的 issue 中看到的
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

/**
 * *本质就是一个 while 循环，不断去遍历 element 的 parentNode，如果其中有一个 parentNode 是包含块，那么就直接返回，不然就继续向上遍历，如果都不是包含块，那么就返回 null
 */
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
 * *其实可以理解为获取 element 的真实包含块
 * */
export function getOffsetParent(element: Element): Element | Window {
  const window = getWindow(element);

  // *获取 offsetParent
  let offsetParent = getTrueOffsetParent(element);

  // *循环判断，如果 offsetParent 是 table 元素(table, td, th) 并且还是 static 定位，那么将继续向上寻找 offsetParent；
  // *因为 offsetParent 要不然是定位元素，要不然就是特殊元素；通过这个循环，让 offsetParent 只能是定位元素 或 body 或 html
  while (
    offsetParent &&
    isTableElement(offsetParent) &&
    getComputedStyle(offsetParent).position === 'static'
  ) {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  // *这个函数的主要作用就是找到 floating 相对于哪个元素进行位移；然后上面过滤了表格元素，现在就剩下「普通定位元素, body, html, null」
  // *而正常情况下，floating 应该相对于它的包含块进行位移，如果 offsetParent 是普通定位元素，那么 offsetParent 必定是 floating 的包含块，就直接到下面的 return 进行返回了；
  // *如果是 html 或 body， 但是 html 或 body 并不一定是 floating 的包含块，所以需要这里进行判断；如果不是包含块，那么就会相对于 window 进行位移；
  // ?为什么要判断是不是包含块呢？issue 对应：https://github.com/floating-ui/floating-ui/issues/1375 假设 body 有 transform: translateY(200px)，body 是包含块，如果不判断包含块的话，那么就会直接返回 window，计算 reference 与 window 的相对距离，然后进行位移，肯定是错误的，所以需要对 html body 判断不是包含块的情况下才返回 window
  // ?为什么要相对于 window 定位呢？ issue 对应：https://github.com/floating-ui/floating-ui/pull/1148 因为 floating 就是相对于 window 进行进行位移的呀，比如 body 有一个 10px 的边框，tooltip 的 top: 0，可以发现，tooltip 还是紧挨着视口顶部，而不是 body 的边框下。
  if (
    offsetParent &&// offsetParent 存在
    (getNodeName(offsetParent) === 'html' ||// offsetParent 是 html
      (getNodeName(offsetParent) === 'body' && // offsetParent 是 body
        getComputedStyle(offsetParent).position === 'static' &&// offsetParent 是 static 定位
        !isContainingBlock(offsetParent)))// *offsetParent 不是包含块  不是说元素只有在 absolute 或 fixed 定位情况下才可以判断包含块吗？为什么这里可以直接判断 offsetParent 呢？因为这里的 element 是指 floating 浮动元素，它必然是 absolute 或 fixed 定位，所以就可以判断这个 offsetParent 是否是 element 的包含块
  ) {
    return window;
  }

  // *offsetParent 存在的话，那么 offsetParent 必定是包含块
  // *如果为 null 的话，就通过 element 获取包含块
  // *实在不行再返回 window
  // ?为啥不直接使用 getContainingBlock 获取包含块呢？我能想到的原因就是为了减少运算，getContainingBlock 使用 while 循环，不断遍历 element 的 parentNode 在层级比较多的情况下运算压力更大
  return offsetParent || getContainingBlock(element) || window;
}
