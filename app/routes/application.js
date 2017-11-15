import Route from '@ember/routing/route';
import RSVP from 'rsvp';

// For development purposes, store is seeded with objects

export default Route.extend({

  model() {
    // Create the test objects without relationships
    
    let store = this.get('store');

    let user1 = store.createRecord('user', {
      username: 'admin'
    });

    let user2 = store.createRecord('user', {
      username: 'bessie'
    });

    let user3 = store.createRecord('user', {
      username: 'farmerbob'
    });

    let grant1 = store.createRecord('grant', {
      number: '0xDEADBEAF',
      agency: 'NIH',
      title: 'Better Ice Cream',
      startDaate: '2015-03-25',
      endDate: '2018-06-02',
      status: 'in progress'
    });

    let grant2 = store.createRecord('grant', {
      number: '1231asd23',
      title: 'Cow mythos realized',
      agency: 'NCA',
      start_date: '2010-02-20',
      end_date: '2019-11-01',
      status: 'in progress'
    });

    let grant3 = store.createRecord('grant', {
      title: 'Datanet: Conserving cow data',
      number: 'dash98765',
      agency: 'NSF',
      start_date: '2010-03-12',
      end_date: '2015-08-10',
      status: 'complete'
    });

    let sub1 = store.createRecord('submission', {
      title: 'Chocolate chip is the best',
      creation_date: '2018-06-02',
      status: 'in progress'
    });

    let sub2 = store.createRecord('submission', {
      title: 'In defense of vanilla',
      creation_date: '2018-06-02',
      status: 'in progress'
    });


    let sub3 = store.createRecord('submission', {
      title: 'Chocolate, how can you go wrong?',
      creation_date: '2018-06-02',
      status: 'in progress'      
    });


    let sub4 = store.createRecord('submission', {
      title: 'Animal farm: The prophecy comes true.',
      creation_date: '2018-06-02',
      status: 'complete'
    });

    // Persist the test objects, add relationships, and then persist again.

    let objects = [user1, user2, user3, grant1, grant2, grant3, sub1, sub2, sub3, sub4];
    
    RSVP.all(objects.map(o => o.save())).then(() => {
      grant1.set('creator', user1);
      grant2.set('creator', user2);
      grant3.set('creator', user3);

      sub1.set('creator', user1);
      sub2.set('creator', user2);
      sub3.set('creator', user3);
      sub4.set('creator', user1);

      grant1.get('submissions').pushObject(sub1);
      grant1.get('submissions').pushObject(sub2);
      sub1.get('grants').pushObject(grant1);

      grant2.get('submissions').pushObject(sub2);
      grant2.get('submissions').pushObject(sub3);
      sub2.get('grants').pushObject(grant1);
      sub2.get('grants').pushObject(grant2);

      grant3.get('submissions').pushObject(sub4);
      sub4.get('grants').pushObject(grant3);
      
      RSVP.all(objects.map(o => o.save()));
    });
  }
});
