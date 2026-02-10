import RouteTemplate from 'ember-route-template';

// prettier-ignore
export default RouteTemplate(
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
  </template>,
);
