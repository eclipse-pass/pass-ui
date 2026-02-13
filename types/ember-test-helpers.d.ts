import '@ember/test-helpers';

declare module '@ember/test-helpers' {
  interface TestContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server: any;
    element: Element | Document;
    // Allow dynamic properties set via this.set() / this.prop = value in tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
