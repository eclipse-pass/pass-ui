import '@ember/test-helpers';
import type { Server } from 'miragejs';

declare module '@ember/test-helpers' {
  interface TestContext {
    // Mirage server, typed loosely to allow server.create() with custom attributes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mirage Server<AnyRegistry> rejects custom model attributes
    server: Server<any>;
    element: Element | Document;
    // Allow dynamic properties set via this.set() / this.prop = value in tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
