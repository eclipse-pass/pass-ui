import Swal from 'sweetalert2/dist/sweetalert2.js';

/**
 * Accessibility fixes for a SweetAlert2 popup:
 *  - The icon ("!", "i", "?", ...) is decorative; the title already says what it means.
 *    Hide it so screen readers don't announce a lone "!".
 *  - SweetAlert2 puts aria-live="assertive" on modal dialogs. A live region on a dialog makes
 *    screen readers read its raw contents (or nothing) instead of announcing the dialog's name and
 *    description from aria-labelledby / aria-describedby when focus moves into it. Toasts keep their
 *    live region, since they don't take focus.
 *
 * Applied from `didRender`, so it also survives `swal.update()`.
 */
export function makePopupAccessible(popup: HTMLElement): void {
  if (popup.getAttribute('role') === 'dialog') {
    popup.removeAttribute('aria-live');
  }
  popup.querySelector('.swal2-icon')?.setAttribute('aria-hidden', 'true');
}

/**
 * SweetAlert2 configured for PASS. Use this instead of importing sweetalert2 directly; it has the
 * same API (`fire`, `close`, `mixin`, `DismissReason`, ...).
 *
 * If a call needs its own `didRender`, it replaces this one, so call `makePopupAccessible(popup)`
 * from it.
 */
const swal = Swal.mixin({
  didRender: makePopupAccessible,
});

export default swal;
