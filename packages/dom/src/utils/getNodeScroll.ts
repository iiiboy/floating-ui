import {NodeScroll} from '../types';
import {isElement} from './is';

/**
 * *该函数返回元素滚动了多少，如果 element 是元素的话，就返回 scrollLeft, scrollTop; 如果 element 是 window 的话，就返回 pageXOffset, pageYOffset
 * */
export function getNodeScroll(element: Element | Window): NodeScroll {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    };
  }

  return {
    scrollLeft: element.pageXOffset,
    scrollTop: element.pageYOffset,
  };
}
