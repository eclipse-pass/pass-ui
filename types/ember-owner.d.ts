import '@ember/owner';

declare module '@ember/owner' {
  export default interface Owner {
    /** Not on the public Owner type but available at runtime. */
    unregister(fullName: string): void;
  }
}
