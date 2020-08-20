import ENV from 'pass-ember/config/environment';
import users from './routes/users';
import elastic from './routes/elastic-search';
import journals from './routes/journals';
import policies from './routes/policies';
import funders from './routes/funders';
import repositories from './routes/repositories';
import publications from './routes/publications';
import submissions from './routes/submissions';
import submissionEvents from './routes/submission-events';
import files from './routes/files';
import schemas from './routes/schemas';
import grants from './routes/grants';

export default function () {
  this.urlPrefix = ENV.host;

  users(this);
  elastic(this);
  journals(this);
  policies(this);
  funders(this);
  repositories(this);
  publications(this);
  submissions(this);
  submissionEvents(this);
  files(this);
  schemas(this);
  grants(this);


  this.passthrough();
  this.passthrough(`${ENV.fedora.base}**`);
  this.passthrough(`${ENV.fedora.base}`.replace('_search', '_stats/index'));
}
