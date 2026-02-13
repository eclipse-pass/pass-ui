declare module 'htmlbars-inline-precompile' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function hbs(template: TemplateStringsArray): any;
}

declare module 'ember-cli-flash/flash/object' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FlashObject: any;
  export default FlashObject;
}

declare module 'ember-sinon-qunit' {
  export default function setupSinon(): void;
}

declare module 'ember-file-upload/test-support' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function selectFiles(selector: string, ...files: any[]): Promise<void>;
}

declare module 'ember-simple-auth/test-support' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function authenticateSession(data?: any): Promise<void>;
  export function invalidateSession(): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function currentSession(): any;
}

declare module 'ember-mirage/test-support' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function setupMirage(hooks: any, options?: any): void;
}

declare module '@embroider/virtual/compat-modules' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compatModules: any;
  export default compatModules;
}
