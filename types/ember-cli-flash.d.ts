import type { FlashMessagesService } from 'ember-cli-flash';

/**
 * Extended flash-messages service type that includes the `error` method.
 *
 * `ember-cli-flash` ships typed `success`, `info`, `warning`, `danger`,
 * `alert`, and `secondary` methods.  This app also calls `.error()` which
 * works at runtime via the dynamic `[key: string]` index signature, but
 * TypeScript cannot call a value typed as `unknown`.  We re-declare the
 * service with `error` as a first-class method so every call-site is
 * properly typed without resorting to `any`.
 */
interface FlashMessageService extends FlashMessagesService {
  error: FlashMessagesService['danger'];
}

export type { FlashMessageService };
