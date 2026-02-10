import RouteTemplate from 'ember-route-template';
import { on } from '@ember/modifier';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FlashMessage from 'ember-cli-flash/components/flash-message';
import config from 'pass-ui/config/environment';
import NavBar from 'pass-ui/components/nav-bar';
import NoticeBanner from 'pass-ui/components/notice-banner';

// prettier-ignore
export default RouteTemplate(
  <template>
    {{! template-lint-disable require-valid-alt-text }}
    <div id='brand-site-container' class='site' tabindex='-1'>
      <div id='ember-bootstrap-wormhole'></div>

      <header id='brand-header' class='navbar navbar-expand-xs justify-content-center mb-0'>
        <div class={{if @controller.fullWidth 'container-fluid' 'container'}}>
          <a href='/' class='navbar-brand d-none d-sm-block'>
            <h3 class='brand-header-title font-weight-light'>
              Public Access Submission System
            </h3>
          </a>
          <a href='/' class='navbar-brand custom-color d-xs-block d-sm-none'>
            <h3 class='brand-header-title font-weight-light'>
              P.A.S.S.
            </h3>
          </a>
          {{#if @controller.logoUri}}
            <a href='{{@controller.homepage}}'>
              <img
                id='brand-logo'
                src='{{@controller.logoUri}}'
                alt='Logo'
                class='nav-item d-sm-down-none pull-right brand-logo pr-0'
              />
            </a>
          {{/if}}
        </div>
      </header>
      {{#if @controller.showNoticeBanner}}
        <NoticeBanner contactUrl={{@controller.contactUrl}} />
      {{/if}}
      <div id='navbar-container'>
        <NavBar @fullWidth={{@controller.fullWidth}} />
      </div>
      <main class='container-fluid site-content'>
        <div class='flash-message-container'>
          {{#each @controller.flashMessages.queue as |flash|}}
            <FlashMessage @flash={{flash}} as |component flash close|>
              <div class='d-flex justify-content-between'>
                {{flash.message}}
                <span role='button' {{on 'click' close}}>
                  x
                </span>
              </div>
            </FlashMessage>
          {{/each}}
        </div>

        {{@controller.institution}}
        {{outlet}}
      </main>
      <footer class='app-footer justify-content-center mt-3'>
        <div class='text-center p-1'>
          {{#if @controller.contactUrl}}
            <small>
              Interested in making PASS even better? Want to have PASS for your institution?
              <a href='{{@controller.assetsUri}}contact.html'>
                Contact us!
              </a>
            </small>
          {{/if}}
          <br />
          <small>
            rev.&nbsp;{{config.APP.version}}
          </small>
        </div>
      </footer>
    </div>
  </template>,
);
