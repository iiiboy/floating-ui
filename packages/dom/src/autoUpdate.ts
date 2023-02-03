import type {FloatingElement, ReferenceElement} from './types';
import {getBoundingClientRect} from './utils/getBoundingClientRect';
import {getOverflowAncestors} from './utils/getOverflowAncestors';
import {isElement} from './utils/is';

export interface Options {
  /**
   * Whether to update the position when an overflow ancestor is scrolled.
   * @default true
   */
  ancestorScroll: boolean;

  /**
   * Whether to update the position when an overflow ancestor is resized. This
   * uses the native `resize` event.
   * @default true
   */
  ancestorResize: boolean;

  /**
   * Whether to update the position when either the reference or floating
   * elements resized. This uses a `ResizeObserver`.
   * @default true
   */
  elementResize: boolean;

  /**
   * Whether to update on every animation frame if necessary. Optimized for
   * performance so updates are only called when necessary, but use sparingly.
   * @default false
   */
  animationFrame: boolean;
}

/**
 * *简单的来说，原理就是绑定 resize，scroll 事件，监听 reference，floating 元素的 resize 触发了就重新定位
 * Automatically updates the position of the floating element when necessary.
 * @see https://floating-ui.com/docs/autoUpdate
 */
export function autoUpdate(
  reference: ReferenceElement,
  floating: FloatingElement,
  update: () => void,
  options: Partial<Options> = {}
) {
  const {
    ancestorScroll: _ancestorScroll = true,
    ancestorResize = true,
    elementResize = true,
    animationFrame = false,
  } = options;

  const ancestorScroll = _ancestorScroll && !animationFrame;

  const ancestors =
    ancestorScroll || ancestorResize
      ? [
          ...(isElement(reference)
            ? getOverflowAncestors(reference)
            : reference.contextElement
            ? getOverflowAncestors(reference.contextElement)
            : []),
          ...getOverflowAncestors(floating),
        ]
      : [];

  ancestors.forEach((ancestor) => {
    ancestorScroll &&
      ancestor.addEventListener('scroll', update, {passive: true});
    ancestorResize && ancestor.addEventListener('resize', update);
  });

  let observer: ResizeObserver | null = null;
  if (elementResize) {
    // *因为第一次执行 observe 就会执行一次回调函数，所以这里声明一个变量，初始化时不进行 update 优化性能
    let initialUpdate = true;
    observer = new ResizeObserver(() => {
      if (!initialUpdate) {
        update();
      }

      initialUpdate = false;
    });
    isElement(reference) && !animationFrame && observer.observe(reference);
    if (!isElement(reference) && reference.contextElement && !animationFrame) {
      observer.observe(reference.contextElement);
    }
    observer.observe(floating);
  }

  let frameId: number;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;

  if (animationFrame) {
    frameLoop();
  }

  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);

    if (
      prevRefRect &&
      (nextRefRect.x !== prevRefRect.x ||
        nextRefRect.y !== prevRefRect.y ||
        nextRefRect.width !== prevRefRect.width ||
        nextRefRect.height !== prevRefRect.height)
    ) {
      update();
    }

    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }

  update();

  return () => {
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });

    observer?.disconnect();
    observer = null;

    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
