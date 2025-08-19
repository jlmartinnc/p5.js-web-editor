import { useEffect, useRef, MutableRefObject } from 'react';
import useKeyDownHandlers from './useKeyDownHandlers';

/**
 * Common logic for Modal, Overlay, etc.
 *
 * Pass in the `onClose` handler.
 *
 * Can optionally pass in a ref, in case the `onClose` function needs to use the ref.
 *
 * Calls the provided `onClose` function on:
 *  - Press Escape key.
 *  - Click outside the element.
 *
 * Returns a ref to attach to the outermost element of the modal.
 *
 * @param onClose - Function called when modal should close
 * @param passedRef - Optional ref to the modal element. If not provided, one is created internally.
 * @returns A ref to be attached to the modal DOM element
 */
export function useModalClose(
  onClose: () => void,
  passedRef?: MutableRefObject<HTMLElement | null>
): MutableRefObject<HTMLElement | null> {
  const createdRef = useRef<HTMLElement | null>(null);
  const modalRef = passedRef ?? createdRef;

  useEffect(() => {
    modalRef.current?.focus();

    function handleClick(e: MouseEvent) {
      // ignore clicks on the component itself
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('click', handleClick, false);

    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [onClose, modalRef]);

  useKeyDownHandlers({ escape: onClose });

  return modalRef;
}
