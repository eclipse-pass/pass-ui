import Route from '@ember/routing/route';
import AuthenticateRouteMixin from '../../mixins/authenticate-route-mixin';

export default Route.extend(AuthenticateRouteMixin, {
    model(params) {
        return this.get('store').findRecord('submission', params.submission_id,
                {include: ['grants', 'workflows', 'deposits']});
    }
});