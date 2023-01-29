import type {VirtualElement} from '../types';
import {isElement} from './is';

/**
 * *函数的作用是获取真实的 HTMlElement；
 *
 * *因为这里的 element 还可能是 VirtualElement；所以需要先判断 element 是不是派生于 Element 如果是的话就直接返回 Element 如果不是那就返回 contextElement
 *
 * *VirtualElement 是 @floating-ui 提供的功能，我们可以提供一个虚拟元素，让 floating 元素相对于虚拟元素定位；可用于跟随光标等。 https://floating-ui.com/docs/virtual-elements
 * */
export function unwrapElement(element: Element | VirtualElement) {
  return !isElement(element) ? element.contextElement : element;
}
