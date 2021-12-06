import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import Bootstrap4Theme from 'ember-models-table/themes/bootstrap4';
import { inject as service } from '@ember/service';

export default class GrantsIndexController extends Controller {
  @service currentUser;
  @service('app-static-config') configurator;

  constructor() {
    super(...arguments);

    this.configurator.getStaticConfig()
      .then(config => this.set('assetsUri', config.assetsUri));
  }

  themeInstance = Bootstrap4Theme.create();
  // TODO Reduce duplication in column definitions
  metricsColumns = [
    {
      propertyName: '.projectName',
      title: 'Metric',
    },
    {
      propertyName: 'grant.primaryFunder.name',
      title: 'Description',
      filterWithSelect: true,
      predefinedFilterOptions: ['NIH', 'DOE', 'NSF'],
    },
    {
      propertyName: 'grant.awardNumber',
      title: 'Value',
      disableFiltering: true,
    },
  ] 

  @tracked assetsUri = null;
  // Bound to message dialog.
  @tracked messageShow = false;
  @tracked messageTo = '';
  @tracked messageSubject = '';
  @tracked messageText = '';
  @tracked tablePageSize = 10;
  @tracked tablePageSizeValues = [10, 25, 50];
  @tracked user = this.currentUser.user;

  // Columns displayed depend on the user role
  get columns() {
    return this.metricsColumns;
  }
}
