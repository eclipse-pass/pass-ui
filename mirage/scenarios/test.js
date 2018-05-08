export default function (server) {
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  // server.createList('post', 10);
  let user = server.create('user');
  // let repository = server.create('repository', { name: 'DoE' });
  // let jscholarship = server.create('repository', { name: 'JScholarship' });
  // let jpolicy = server.create('policy', { repository: jscholarship });
  // let policy = server.create('policy', { repository });
  // let funder = server.create('funder', { policy });

  // let grant = server.create('grant', { primaryFunder: funder });
  // let journal = server.create('journal');
}
