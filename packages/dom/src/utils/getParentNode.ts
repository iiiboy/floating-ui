import {getDocumentElement} from './getDocumentElement';
import {getNodeName} from './getNodeName';
import {isShadowRoot} from './is';

export function getParentNode(node: Node): Node {
  if (getNodeName(node) === 'html') {
    return node;
  }

  const result =
    // Step into the shadow DOM of the parent of a slotted node.
    // *与 web components 有关，比如有一个 web component 有一个 <slot name="span"></slot> 然后此时有一个 <span slot="span" /> 那么这个 span 就会被放到 slot 里面 <slot name="span"><span slot="span" /></slot> 那么这个 span 的 assignedSlot 将会返回这个 slot；就是为了能在 web components 里面也找到正确的父节点； assignedSlot 与 <slot> 兼容性一致
    (node as any).assignedSlot ||
    // DOM Element detected.
    node.parentNode ||
    // ShadowRoot detected.
    // *也是 web components 里面的概念
    (isShadowRoot(node) && node.host) ||
    // Fallback.
    getDocumentElement(node);

  return isShadowRoot(result) ? result.host : result;
}
