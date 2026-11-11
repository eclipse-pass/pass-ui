import Swal from 'sweetalert2/dist/sweetalert2.js';

/**
 * Accessibility fixes for a SweetAlert2 popup:
 *  - The icon ("!", "i", "?", ...) is decorative; the title already says what it means.
 *    Hide it so screen readers don't announce a lone "!".
 *  - SweetAlert2 puts aria-live="assertive" on modal dialogs. A live region on a dialog makes
 *    screen readers read its raw contents (or nothing) instead of announcing the dialog's name and
 *    description from aria-labelledby / aria-describedby when focus moves into it. Toasts keep their
 *    live region, since they don't take focus.
 *  - That dialog live region was also what announced showValidationMessage() text. Give the
 *    validation message its own polite live region.
 */
export function makePopupAccessible(popup: HTMLElement): void {
  if (popup.getAttribute('role') === 'dialog') {
    popup.removeAttribute('aria-live');
  }
  popup.querySelector('.swal2-icon')?.setAttribute('aria-hidden', 'true');

  const validationMessage = popup.querySelector('.swal2-validation-message');
  validationMessage?.setAttribute('aria-live', 'polite');
  validationMessage?.setAttribute('aria-atomic', 'true');
}

// SweetAlert2's global event API (not in its type definitions). A handler registered here runs on
// every render of every popup, including swal.update(), and a call's own didRender can't replace it.
type SwalEvents = { on(eventName: 'didRender', handler: (popup: HTMLElement) => void): void };
(Swal as unknown as SwalEvents).on('didRender', makePopupAccessible);

/**
 * SweetAlert2 for PASS. Import this instead of sweetalert2 so the accessibility fixes above are
 * registered; it is SweetAlert2 itself, with the same API (`fire`, `close`, `mixin`, `DismissReason`, ...).
 */
export default Swal;
