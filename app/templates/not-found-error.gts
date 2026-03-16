import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type NotFoundErrorController from 'pass-ui/controllers/not-found-error';

interface Signature {
  Args: {
    controller: NotFoundErrorController;
  };
}

// prettier-ignore
<template>
  {{outlet}}
  <div class='row'>
    <div class='col-2'>
      <img src='{{@controller.icon}}' alt='Error icon' />
    </div>
    <div class='col my-auto'>
      <h2>404: Page not found</h2>
      <p class='helpful-text'>
        Looks like the page you're looking for does not exist. If you think there is a problem with the site, please
        {{#if @controller.contactUrl}}
          <a href='{{@controller.contactUrl}}'>let us know</a>.
        {{else}}
          contact your administrator.
        {{/if}}
      </p>
    </div>
  </div>
</template> satisfies TemplateOnlyComponent<Signature>
