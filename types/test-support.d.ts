declare module 'htmlbars-inline-precompile' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- render() requires any return type
  export default function hbs(template: TemplateStringsArray): any;
}

declare module 'ember-sinon-qunit' {
  export default function setupSinon(): void;
}

declare module 'ember-file-upload/test-support' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helpers accept Blob or File
  export function selectFiles(selector: string, ...files: any[]): Promise<void>;
}

declare module 'ember-simple-auth/test-support' {
  export function authenticateSession(data?: Record<string, unknown>): Promise<void>;
  export function invalidateSession(): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- session object shape varies
  export function currentSession(): any;
}

declare module 'ember-mirage/test-support' {
  export function setupMirage(hooks: NestedHooks, options?: Record<string, unknown>): void;
}

declare module '@embroider/virtual/compat-modules' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- compat module map requires flexible types
  const compatModules: any;
  export default compatModules;
}
