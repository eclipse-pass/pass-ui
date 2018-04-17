export default function (server) {
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  // server.createList('post', 10);
  let user = server.create('user');
  let person = server.create('person', { user });
  let repository = server.create('repository', { name: 'DoE' });
  let policy = server.create('policy', { repository });
  let funder = server.create('funder', { repository });
  let grant = server.create('grant', { funder });
  let journal = server.create('journal');
}
