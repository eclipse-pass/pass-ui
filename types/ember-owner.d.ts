import '@ember/owner';

declare module '@ember/owner' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default interface Owner {
    /**
     * More permissive lookup overload. Ember's default returns `unknown` for
     * unregistered names; tests (and most app code in this codebase) need the
     * result to be callable without an intermediate cast.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lookup(fullName: string): any;

    /** Not on the public Owner type but available at runtime. */
    unregister(fullName: string): void;
  }
}
