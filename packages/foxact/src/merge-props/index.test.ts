import { describe, it } from 'mocha';
import { expect } from 'earl';
import sinon from 'sinon';

import { mergeProps } from '.';

describe('mergeProps', () => {
  it('merges event handlers', () => {
    const theirOnClick = sinon.spy();
    const theirOnKeyDown = sinon.spy();
    const ourOnClick = sinon.spy();
    const ourOnPaste = sinon.spy();

    const mergedProps = mergeProps<'button'>(
      { onClick: ourOnClick, onPaste: ourOnPaste },
      { onClick: theirOnClick, onKeyDown: theirOnKeyDown }
    );

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any);
    mergedProps.onKeyDown?.({ nativeEvent: new KeyboardEvent('keydown') } as any);
    mergedProps.onPaste?.({ nativeEvent: new Event('paste') } as any);

    expect(theirOnClick.calledOnce).toEqual(true);
    expect(ourOnClick.calledOnce).toEqual(true);
    expect(theirOnClick.calledBefore(ourOnClick)).toEqual(true);
    expect(theirOnKeyDown.calledOnce).toEqual(true);
    expect(ourOnPaste.calledOnce).toEqual(true);
  });

  it('merges multiple event handlers in right-to-left order', () => {
    const log: string[] = [];

    const mergedProps = mergeProps<'button'>(
      { onClick() { log.push('3'); } },
      { onClick() { log.push('2'); } },
      { onClick() { log.push('1'); } }
    );

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any);
    expect(log).toEqual(['1', '2', '3']);
  });

  it('merges undefined event handlers', () => {
    const log: string[] = [];

    const mergedProps = mergeProps<'button'>(
      { onClick() { log.push('3'); } },
      { onClick: undefined },
      { onClick() { log.push('1'); } }
    );

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any);
    expect(log).toEqual(['1', '3']);
  });

  it('merges styles', () => {
    const mergedProps = mergeProps<'div'>(
      { style: { color: 'blue', backgroundColor: 'blue' } },
      { style: { color: 'red' } }
    );

    expect(mergedProps.style).toEqual({
      color: 'red',
      backgroundColor: 'blue'
    });
  });

  it('merges styles with undefined', () => {
    const mergedProps = mergeProps<'button'>({}, { style: { color: 'red' } });
    expect(mergedProps.style).toEqual({ color: 'red' });
  });

  it('does not merge styles if both are undefined', () => {
    const mergedProps = mergeProps<'button'>({}, {});
    expect(mergedProps.style).toEqual(undefined);
  });

  it('merges classNames with rightmost first', () => {
    const mergedProps = mergeProps<'div'>(
      { className: 'internal-class' },
      { className: 'external-class' }
    );

    expect(mergedProps.className).toEqual('external-class internal-class');
  });

  it('merges multiple classNames', () => {
    const mergedProps = mergeProps<'div'>(
      { className: 'class-1' },
      { className: 'class-2' },
      { className: 'class-3' }
    );

    expect(mergedProps.className).toEqual('class-3 class-2 class-1');
  });

  it('merges classNames with undefined', () => {
    const mergedProps = mergeProps<'button'>({}, { className: 'external-class' });
    expect(mergedProps.className).toEqual('external-class');
  });

  it('does not merge classNames if both are undefined', () => {
    const mergedProps = mergeProps<'button'>({}, {});
    expect(mergedProps.className).toEqual(undefined);
  });

  it('rightmost non-special prop wins', () => {
    const mergedProps = mergeProps<'button'>(
      { title: 'internal title 2' },
      { title: 'internal title 1' },
      {}
    );

    expect(mergedProps.title).toEqual('internal title 1');
  });

  it('handles non-standard event handlers without error', () => {
    for (const eventArgument of [true, 13, 'newValue', { key: 'value' }, ['value'], () => 'value']) {
      const log: string[] = [];

      const mergedProps = mergeProps<any>(
        { onValueChange() { log.push('1'); } },
        { onValueChange() { log.push('0'); } }
      );

      mergedProps.onValueChange(eventArgument);

      expect(log).toEqual(['0', '1']);
    }
  });

  it('forwards all arguments for a lone non-standard event handler', () => {
    const handler = sinon.spy();

    const mergedProps = mergeProps<any>(
      {},
      { onOpenChange: handler }
    );

    const eventDetails = { reason: 'test' };
    mergedProps.onOpenChange?.(true, eventDetails);

    expect(handler.calledOnce).toEqual(true);
    expect(handler.calledWith(true, eventDetails)).toEqual(true);
  });

  it('forwards all arguments for merged non-standard event handlers', () => {
    const log: Array<[string, boolean, { reason: string }]> = [];
    const eventDetails = { reason: 'test' };

    const mergedProps = mergeProps<any>(
      {
        onOpenChange(open: boolean, details: { reason: string }) {
          log.push(['ours', open, details]);
        }
      },
      {
        onOpenChange(open: boolean, details: { reason: string }) {
          log.push(['theirs', open, details]);
        }
      }
    );

    mergedProps.onOpenChange?.(true, eventDetails);

    expect(log).toEqual([
      ['theirs', true, eventDetails],
      ['ours', true, eventDetails]
    ]);
  });

  it('forwards additional arguments for synthetic event handlers', () => {
    const log: Array<[string, string]> = [];

    const mergedProps = mergeProps<any>(
      {
        onMouseDown(_event: React.MouseEvent, details: { reason: string }) {
          log.push(['ours', details.reason]);
        }
      },
      {
        onMouseDown(_event: React.MouseEvent, details: { reason: string }) {
          log.push(['theirs', details.reason]);
        }
      }
    );

    mergedProps.onMouseDown?.({ nativeEvent: new MouseEvent('mousedown') } as any, {
      reason: 'pointer'
    });

    expect(log).toEqual([
      ['theirs', 'pointer'],
      ['ours', 'pointer']
    ]);
  });

  describe('props getters', () => {
    it('calls the props getter with the props defined before it', () => {
      let observedProps: Record<string, unknown> | undefined;
      const propsGetter = sinon.spy((props: Record<string, unknown>) => {
        observedProps = { ...props };
        return props;
      });

      mergeProps(
        { id: '2', className: 'test-class' },
        propsGetter,
        { id: '1', role: 'button' }
      );

      expect(propsGetter.calledOnce).toEqual(true);
      expect(observedProps).toEqual({ id: '2', className: 'test-class' });
    });

    it('calls the props getter with merged props defined before it', () => {
      let observedProps: Record<string, unknown> | undefined;
      const propsGetter = sinon.spy((props: Record<string, unknown>) => {
        observedProps = { ...props };
        return props;
      });

      mergeProps(
        { role: 'button', className: 'test-class' },
        { role: 'tab' },
        propsGetter,
        { id: 'one' }
      );

      expect(propsGetter.calledOnce).toEqual(true);
      expect(observedProps).toEqual({
        role: 'tab',
        className: 'test-class'
      });
    });

    it('calls the props getter with an empty object if it is the first argument', () => {
      let observedProps: Record<string, unknown> | undefined;
      const propsGetter = sinon.spy((props: Record<string, unknown>) => {
        observedProps = { ...props };
        return props;
      });

      mergeProps(propsGetter, { id: '1' });

      expect(propsGetter.calledOnce).toEqual(true);
      expect(observedProps).toEqual({});
    });

    it('does not mutate a reused object returned by the first props getter', () => {
      const shared = { className: 'base' };

      const result = mergeProps(() => shared, { className: 'next' });

      expect(result).toEqual({ className: 'next base' });
      expect(shared).toEqual({ className: 'base' });
    });

    it('accepts the result of the props getter', () => {
      const propsGetter = () => ({ className: 'test-class' });
      const result = mergeProps(
        { id: 'two', role: 'tab' },
        { id: 'one' },
        propsGetter
      );

      expect(result).toEqual({ className: 'test-class' });
    });
  });
});

describe('mergeProps', () => {
  it('returns empty props for empty array', () => {
    const result = mergeProps<'div'>([]);
    expect(result).toEqual({});
  });

  it('returns a copy of a single props object', () => {
    const original = { id: 'test', className: 'cls' };
    const result = mergeProps<'div'>([original]);
    expect(result).toEqual(original);
  });

  it('merges multiple props objects', () => {
    const result = mergeProps<'div'>([
      { className: 'a' },
      { className: 'b' },
      { className: 'c' }
    ]);
    expect(result.className).toEqual('c b a');
  });

  it('merges event handlers in right-to-left order', () => {
    const log: string[] = [];

    const result = mergeProps<'button'>([
      { onClick() { log.push('1'); } },
      { onClick() { log.push('2'); } },
      { onClick() { log.push('3'); } }
    ]);

    result.onClick?.({ nativeEvent: new MouseEvent('click') } as any);
    expect(log).toEqual(['3', '2', '1']);
  });
});
