/* eslint-disable prefer-arrow-callback */
import ENV from 'pass-ember/config/environment';
import users from './routes/users';
import elastic from './routes/elastic-search';
import journals from './routes/journals';
import policies from './routes/policies';
import funders from './routes/funders';
import repositories from './routes/repositories';
import publications from './routes/publications';
import submissions from './routes/submissions';
import files from './routes/files';
import schemas from './routes/schemas';

export default function () {
  this.urlPrefix = ENV.host;

  this.logging = true;

  users(this);
  elastic(this);
  journals(this);
  policies(this);
  funders(this);
  repositories(this);
  publications(this);
  submissions(this);
  files(this);
  schemas(this);

  this.passthrough();
  this.passthrough(`${ENV.fedora.base}**`);
  this.passthrough(`${ENV.fedora.base}`.replace('_search', '_stats/index'));
}
