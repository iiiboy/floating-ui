import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';

import {
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '../../src';
import type {Props} from '../../src/hooks/useFocus';

jest.useFakeTimers();

function App(props: Props & {dismiss?: boolean; hover?: boolean}) {
  const [open, setOpen] = useState(false);
  const {reference, floating, context} = useFloating({
    open,
    onOpenChange: setOpen,
  });
  const {getReferenceProps, getFloatingProps} = useInteractions([
    useFocus(context, props),
    useDismiss(context, {enabled: !!props.dismiss, referencePress: true}),
    useHover(context, {enabled: !!props.hover}),
  ]);

  return (
    <>
      <button {...getReferenceProps({ref: reference})} />
      {open && <div role="tooltip" {...getFloatingProps({ref: floating})} />}
    </>
  );
}

test('opens on focus', () => {
  render(<App />);
  const button = screen.getByRole('button');
  fireEvent.focus(button);
  expect(screen.queryByRole('tooltip')).toBeInTheDocument();
  cleanup();
});

test('closes on blur', () => {
  render(<App />);
  const button = screen.getByRole('button');
  act(() => button.focus());
  act(() => button.blur());
  act(() => {
    jest.runAllTimers();
  });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  cleanup();
});

test('does not open with a reference pointerDown dismissal', async () => {
  render(<App dismiss />);
  const button = screen.getByRole('button');
  fireEvent.pointerDown(button);
  fireEvent.focus(button);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  cleanup();
});

test('does not open when window blurs then receives focus', async () => {
  // TODO — not sure how to test this in JSDOM
});
