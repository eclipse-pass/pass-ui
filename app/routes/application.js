import Route from '@ember/routing/route';
import RSVP from 'rsvp';

// For development purposes, store is seeded with objects

export default Route.extend({

  model() {
    // Create the test objects without relationships

    let store = this.get('store');

    let user1 = store.createRecord('user', {
      username: 'admin',
      role: 'admin'
    });

    let user2 = store.createRecord('user', {
      username: 'bessie',
      role: 'pi'
    });

    let user3 = store.createRecord('user', {
      username: 'farmerbob',
      role: 'pi'
    });

    let grant1 = store.createRecord('grant', {
      number: '0xDEADBEAF',
      agency: 'NIH',
      title: 'Better Ice Cream',
      startDate: new Date('2015-03-25'),
      endDate: new Date('2018-06-02'),
      status: 'in progress'
    });

    let grant2 = store.createRecord('grant', {
      number: '1231asd23',
      title: 'Cow mythos realized',
      agency: 'NCA',
      startDate: new Date('2010-02-20'),
      endDate: new Date('2019-11-01'),
      status: 'in progress'
    });

    let grant3 = store.createRecord('grant', {
      title: 'Datanet: Conserving cow data',
      number: 'dash98765',
      agency: 'NSF',
      startDate: new Date('2010-03-12'),
      endDate: new Date('2015-08-10'),
      status: 'complete'
    });

    let sub1 = store.createRecord('submission', {
      title: 'Chocolate chip is the best',
      creationDate: new Date('2018-06-02'),
      status: 'in progress'
    });

    let sub2 = store.createRecord('submission', {
      title: 'In defense of vanilla',
      creationDate: new Date('2018-06-02'),
      status: 'in progress'
    });


    let sub3 = store.createRecord('submission', {
      title: 'Chocolate, how can you go wrong?',
      creationDate: new Date('2018-06-02'),
      status: 'in progress'
    });


    let sub4 = store.createRecord('submission', {
      title: 'Animal farm: The prophecy comes true.',
      creationDate: new Date('2018-06-02'),
      status: 'complete'
    });

    // Persist the test objects, add relationships, and then persist again.

    let objects = [user1, user2, user3, grant1, grant2, grant3, sub1, sub2, sub3, sub4];

    return RSVP.all(objects.map(o => o.save())).then(() => {
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

      return RSVP.all(objects.map(o => o.save())).then(() => {
        return this.controllerFor('application').get('session').login('admin');
      })
    });
  }
});
