import { setModifierManager, capabilities } from '@ember/modifier';
import { untrack } from '@glimmer/validator';
import type { ModifierLike } from '@glint/template';

interface DidUpdateState {
  element: Element | null;
}

/**
 * A replacement for `@ember/render-modifiers` {{did-update}}.
 * Skips the initial render (installModifier only entangles tracking).
 * On subsequent updates, calls `fn(element, positionalArgs, namedArgs)` inside `untrack()`.
 */
const didUpdate = setModifierManager(
  () => ({
    capabilities: capabilities('3.22', { disableAutoTracking: false }),

    createModifier(): DidUpdateState {
      return { element: null };
    },

    installModifier(
      state: DidUpdateState,
      element: Element,
      args: { positional: unknown[]; named: Record<string, unknown> },
    ) {
      // Save element for updateModifier
      state.element = element;
      // Consume args to entangle tracking (so updates are detected)
      args.positional.forEach(() => {});
      if (args.named) Object.values(args.named);
    },

    updateModifier(state: DidUpdateState, args: { positional: unknown[]; named: Record<string, unknown> }) {
      const [fn, ...positional] = args.positional;
      // Consume args to entangle tracking
      args.positional.forEach(() => {});
      if (args.named) Object.values(args.named);
      // Call the function inside untrack so it doesn't create circular tracking
      untrack(() => {
        (fn as (el: Element, pos: unknown[], named: Record<string, unknown>) => void)(
          state.element!,
          positional,
          args.named,
        );
      });
    },

    destroyModifier() {
      // nothing to clean up
    },
  }),
  class DidUpdateModifier {},
);

export default didUpdate as unknown as ModifierLike<{
  Element: Element;
  Args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Positional: [fn: (element: Element, ...args: any[]) => void, ...rest: unknown[]];
    Named: Record<string, unknown>;
  };
}>;
