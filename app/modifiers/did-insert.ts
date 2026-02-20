import { setModifierManager, capabilities } from '@ember/modifier';
import type { ModifierLike } from '@glint/template';

/**
 * A replacement for `@ember/render-modifiers` {{did-insert}}.
 * Calls `fn(element, positionalArgs, namedArgs)` once when the element is inserted.
 * Does NOT re-fire on updates.
 */
const didInsert = setModifierManager(
  () => ({
    capabilities: capabilities('3.22', { disableAutoTracking: true }),

    createModifier() {
      // no state needed
    },

    installModifier(
      _state: undefined,
      element: Element,
      args: { positional: unknown[]; named: Record<string, unknown> },
    ) {
      const [fn, ...positional] = args.positional;
      (fn as (el: Element, pos: unknown[], named: Record<string, unknown>) => void)(element, positional, args.named);
    },

    updateModifier() {
      // did-insert does not re-fire on updates
    },

    destroyModifier() {
      // nothing to clean up
    },
  }),
  class DidInsertModifier {},
);

export default didInsert as unknown as ModifierLike<{
  Element: Element;
  Args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Positional: [fn: (element: Element, ...args: any[]) => void, ...rest: unknown[]];
    Named: Record<string, unknown>;
  };
}>;
