declare module '@glimmer/validator' {
  export function untrack<T>(callback: () => T): T;
}
