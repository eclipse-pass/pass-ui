import CheckSessionRoute from './check-session-route';
import ENV from 'pass-ember/config/environment';
import { inject as service } from '@ember/service';

export default class DashboardRoute extends CheckSessionRoute {
  @service('current-user') currentUser;

  async model() {
    const url = `${ENV.fedora.elasticsearch}?q=@type:Journal`;
    // Value count aggregation on the journal field
    const aggregation = {
      query: {
        bool: {
          must: [
            { match: { '@type': 'Publication' } },
            { exists: { field: 'journal' } },
          ],
        },
      },
    };
    const journals = [];
    await fetch(`${ENV.fedora.elasticsearch}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aggregation),
    })
      .then((res) =>
        res.json().then((data) => {
          for (let journal in data.hits.hits) {
            journals.push(journal.journalName);
          }
          console.log(data);
        })
      )
      .catch((err) => console.log(err));

    return {
      journals,
    }
  }
}
