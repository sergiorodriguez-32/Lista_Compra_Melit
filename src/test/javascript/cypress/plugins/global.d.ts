// workaround missing typings
declare module 'cypress-monocart-coverage' {
  export default function codecov(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions, options: any): void;
}
declare module 'cypress-monocart-coverage/support';
