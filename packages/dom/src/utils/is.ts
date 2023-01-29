import {getComputedStyle} from './getComputedStyle';
import {getNodeName} from './getNodeName';
import {getUAString} from './userAgent';
import {getWindow} from './window';

declare global {
  interface Window {
    HTMLElement: any;
    Element: any;
    Node: any;
    ShadowRoot: any;
  }
}

export function isHTMLElement(value: any): value is HTMLElement {
  return value instanceof getWindow(value).HTMLElement;
}

export function isElement(value: any): value is Element {
  return value instanceof getWindow(value).Element;
}

export function isNode(value: any): value is Node {
  return value instanceof getWindow(value).Node;
}

export function isShadowRoot(node: Node): node is ShadowRoot {
  // Browsers without `ShadowRoot` support.
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  const OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

/**
 * *当元素 overflow 不是 visible 时 && 元素 display 不为 inline, contents 时，返回 ture
 * */
export function isOverflowElement(element: Element): boolean {
  const {overflow, overflowX, overflowY, display} = getComputedStyle(element);
  return (
    /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) &&
    !['inline', 'contents'].includes(display)
  );
}

export function isTableElement(element: Element): boolean {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}

/**
 * *判断元素是否是「包含块」，一个元素的尺寸和定位经常受到**该元素的「包含块」**的影响；通过这个函数，可以判断当前 element 是否是包含块；
 *
 * 对于包含块，mdn 有四种定义：
 *
 * *1. 如果元素 position 是 static, relative, sticky，那么该元素的「包含块」就是离它最近的「祖先**块**元素」（不准确的说法，具体看mdn）
 * *2. 如果元素 position 是 absolute, 那么该元素的「包含块」是距离它最近的 position 不是 static 的祖先元素 （不准确的说法，具体看mdn）
 * *3. 如果元素 position 是 fixed，那么该元素的「包含块」是浏览器视口（不准确的说法，具体看mdn）
 * !4. 除了上面三种情况，通过元素的 position 去寻找元素对应的「包含块」外，还有**判断当前元素是否是包含块**的条件； 如果 position 属性是 absolute 或 fixed，包含块也可能是由满足以下条件的最近父级元素的内边距区的边缘组成的：
 * !    1) transform 或 perspective 的值不是 none
 * !    2) will-change 的值是 transform 或 perspective
 * !    3) filter 的值不是 none 或 will-change 的值是 filter（只在 Firefox 下生效）。
 * !    4) contain 的值是 paint（例如：contain: paint;）
 * !    5) backdrop-filter 的值不是 none（例如：backdrop-filter: blur(10px);）
 *
 * 这个函数就是使用了上面的第四条，用来判断当前元素是否是「包含块」
 *
 * *包含块的详细解释及其定义：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block
 * */
export function isContainingBlock(element: Element): boolean {
  // TODO: Try to use feature detection here instead.
  const isFirefox = /firefox/i.test(getUAString());
  const css = getComputedStyle(element);
  const backdropFilter =
    css.backdropFilter || (css as any).WebkitBackdropFilter;

  // This is non-exhaustive but covers the most common CSS properties that
  // create a containing block.
  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  return (
    css.transform !== 'none' ||
    css.perspective !== 'none' ||
    (backdropFilter ? backdropFilter !== 'none' : false) ||
    (isFirefox && css.willChange === 'filter') ||
    (isFirefox && (css.filter ? css.filter !== 'none' : false)) ||
    ['transform', 'perspective'].some((value) =>
      css.willChange.includes(value)
    ) ||
    ['paint', 'layout', 'strict', 'content'].some((value) => {
      // Add type check for old browsers.
      const contain = css.contain as string | undefined;
      return contain != null ? contain.includes(value) : false;
    })
  );
}

/**
 * *判断当前视口是否为「布局视口」，可以暂时粗略的理解为，只有 safari 不是布局视口 返回 false
 *
 * ?不是很理解为什么需要判断「布局视口」
 *
 * *mdn 对于「布局视口」的解释：https://developer.mozilla.org/en-US/docs/Glossary/Layout_viewport
 * */
export function isLayoutViewport(): boolean {
  // TODO: Try to use feature detection here instead. Feature detection for
  // this can fail in various ways, making the userAgent check the most:
  // reliable:
  // • Always-visible scrollbar or not
  // • Width of <html>

  // Not Safari.
  return !/^((?!chrome|android).)*safari/i.test(getUAString());// *这个正则将匹配 (string)safari，string 中不能含有 chrome 和 android; 测试了 火狐, edge, chrome, safari 发现只有 safari 匹配成功；但是注意，前面有个取反，所以可以简单理解为只有 safari 不是布局视口
}

export function isLastTraversableNode(node: Node) {
  return ['html', 'body', '#document'].includes(getNodeName(node));
}
