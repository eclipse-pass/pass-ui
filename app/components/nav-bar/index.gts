import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { on } from '@ember/modifier';
import { modifier } from 'ember-modifier';
import { LinkTo } from '@ember/routing';
import type CurrentUserService from 'pass-ui/services/current-user';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type SessionService from 'ember-simple-auth/services/session';
import type Owner from '@ember/owner';

interface NavBarSignature {
  Args: {
    fullWidth?: boolean;
  };
}

export default class NavBar extends Component<NavBarSignature> {
  @service declare currentUser: CurrentUserService;
  @service declare appStaticConfig: AppStaticConfigService;
  @service declare session: SessionService;

  @tracked aboutUrl: string | null = null;
  @tracked contactUrl: string | null = null;
  @tracked faqUrl: string | null = null;
  @tracked isUserMenuOpen = false;

  constructor(owner: Owner, args: NavBarSignature['Args']) {
    super(owner, args);
    this._setupAppStaticConfig.perform();
  }

  get hasAUser(): boolean {
    return !!this.currentUser.user;
  }

  scrollToAnchor = modifier(() => {
    if (window.location.search.indexOf('anchor=') == -1) {
      window.scrollTo(0, 0);
    }
  });

  @action
  async logOut() {
    const url = `${window.location.origin}/logout`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',

        'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN\=([^;]*)/)![1]!,
      },
    });
    await this.session.invalidate();
  }

  _setupAppStaticConfig = task(async () => {
    const config = await this.appStaticConfig.config;
    if (config && config.branding['showPagesNavBar']) {
      this.aboutUrl = config.branding?.pages?.['aboutUrl'] ?? null;
      this.contactUrl = config.branding?.pages?.['contactUrl'] ?? null;
      this.faqUrl = config.branding?.pages?.['faqUrl'] ?? null;
    }
  });

  @action
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  <template>
    <nav id='header-navbar' class='navbar navbar-light navbar-fixed-top navbar-expand-md w-100' {{this.scrollToAnchor}}>
      <div class={{if @fullWidth 'container-fluid' 'container'}}>
        <div class='col-xs-12 w-100'>
          <button
            class='navbar-toggler text-center border-none'
            type='button'
            data-toggle='collapse'
            data-target='#navbar-supported-content'
            aria-controls='navbar-supported-content'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span class='navbar-toggler-icon'></span>
          </button>
          <div class='collapse navbar-collapse' id='navbar-supported-content'>
            <ul class='navbar-nav w-75'>
              <li class='nav-item'>
                <LinkTo @route='dashboard' class='nav-link pl-0 ml-0'>
                  Dashboard
                </LinkTo>
              </li>
              {{#if this.hasAUser}}
                <li class='nav-item'>
                  <LinkTo @route='grants' class='nav-link' data-test-navbar-grants-link>
                    Grants
                  </LinkTo>
                </li>
                <li class='nav-item'>
                  <LinkTo @route='submissions' class='nav-link' data-test-navbar-submissions-link>
                    Submissions
                  </LinkTo>
                </li>
              {{/if}}
              {{#if this.aboutUrl}}
                <li class='nav-item'>
                  <a class='nav-link' href='{{this.aboutUrl}}'>
                    About
                  </a>
                </li>
              {{/if}}
              {{#if this.contactUrl}}
                <li class='nav-item'>
                  <a class='nav-link' href='{{this.contactUrl}}'>
                    Contact
                  </a>
                </li>
              {{/if}}
              {{#if this.faqUrl}}
                <li class='nav-item'>
                  <a class='nav-link' href='{{this.faqUrl}}'>
                    FAQ
                  </a>
                </li>
              {{/if}}
            </ul>
            <div class='nav-item dropdown ml-auto w-25'>
              <a
                id='user-menu-name'
                class='nav-link dropdown-toggle accountInfo pr-1'
                href='#'
                data-bs-toggle='dropdown'
                role='button'
                aria-haspopup='true'
                aria-expanded='false'
                {{on 'click' this.toggleUserMenu}}
              >
                {{this.currentUser.user.displayName}}
              </a>
              <ul class='dropdown-menu {{if this.isUserMenuOpen "show"}}' aria-labelledby='user-menu-name'>
                <li>
                  <a class='dropdown-item' href='#' {{on 'click' this.logOut}}>
                    <i class='fa fa-lock'></i>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>
}
