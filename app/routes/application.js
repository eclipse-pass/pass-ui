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
      username: 'BenjaminHarman',
      role: 'pi'
    });

    let user4 = store.createRecord('user', {
      username: 'CynthiaSears',
      role: 'pi'
    });


    let funder1 = store.createRecord('funder', {
        name: 'NIH'
    });

    let funder2 = store.createRecord('funder', {
        name: 'NSF'
    });

    let funder3 = store.createRecord('funder', {
        name: 'DOE'
    });

    let coeus1 = store.createRecord('identifier', {
        label: '120023',
        uri: 'http://www.library.jhu.edu'
    });

    let coeus2 = store.createRecord('identifier', {
        label: '298341',
         uri: 'http://www.jhu.edu'
    });

    let coeus3 = store.createRecord('identifier', {
        label: '123445',
        uri: 'http://johnshopkins.edu'
    });
    let coeus4 = store.createRecord('identifier', {
        label: '1200123',
        uri: 'http://www.library.jhu.edu'
    });

    let coeus5 = store.createRecord('identifier', {
        label: '2982341',
         uri: 'http://www.jhu.edu'
    });

    let coeus6 = store.createRecord('identifier', {
        label: '1235445',
        uri: 'http://johnshopkins.edu'
    });
    let coeus7 = store.createRecord('identifier', {
        label: '1204023',
        uri: 'http://www.library.jhu.edu'
    });

    let coeus8 = store.createRecord('identifier', {
        label: '2987341',
         uri: 'http://www.jhu.edu'
    });

    let coeus9 = store.createRecord('identifier', {
        label: '1232445',
        uri: 'http://johnshopkins.edu'
    });
    let coeus10 = store.createRecord('identifier', {
        label: '1200523',
        uri: 'http://www.library.jhu.edu'
    });

    let coeus11 = store.createRecord('identifier', {
        label: '2983441',
         uri: 'http://www.jhu.edu'
    });

    let coeus12 = store.createRecord('identifier', {
        label: '1234456',
        uri: 'http://johnshopkins.edu'
    });
    let coeus14 = store.createRecord('identifier', {
        label: '1234245',
        uri: 'http://johnshopkins.edu'
    });

    let person1 = store.createRecord('person', {
        name: 'Ernest Ford',
        email: 'ford@example.com'
    });

    let person2 = store.createRecord('person', {
        name: 'Anne Gudzune',
        email: 'anne@example.com'
    });

    let person3 = store.createRecord('person', {
        name: 'Stephen Pillage',
        email: 'illage@example.com'
    });

    let person4 = store.createRecord('person', {
        name: 'Eric Frey',
        email: 'frey@example.com'
    });

    let person5 = store.createRecord('person', {
      name: 'Michael Jacobs',
      email: 'mjacobe@example.com'
    });

    let person6 = store.createRecord('person', {
      name: 'John Wong',
      email: 'wongj@jhu.edu'
    });

    let person7 = store.createRecord('person', {
      name: 'Tiffany Brown',
      email: 'tbrown@jhu.edu'
    });
    let person8 = store.createRecord('person', {
      name: 'Hillary Peek',
      email: 'peek@jhu.edu'
    });
    let person9 = store.createRecord('person', {
      name: 'Steve Plimpton',
      email: 'plimpton@jhu.edu'
    });
    let person10 = store.createRecord('person', {
      name: 'Szu Wang',
      email: 'swang@jhu.edu'
    });
    let person11 = store.createRecord('person', {
      name: 'Kurt Sanders',
      email: 'sanders@jhu.edu'
    });
    let person12 = store.createRecord('person', {
      name: 'Robert Bradley',
      email: 'bradley@jhu.edu'
    });
    let person13= store.createRecord('person', {
      name: 'Erin Lewin',
      email: 'elewin@jhu.edu'
    });

    let grant1 = store.createRecord('grant', {
      awardNumber: 'UL1 RR239429',
      projectName: 'Better Ice Cream',
      startDate: new Date('2015-03-25'),
      endDate: new Date('2018-06-02'),
      status: 'Active',
      oapCompliance: "No"
    });

    let grant2 = store.createRecord('grant', {
      awardNumber: 'K23 DK107932',
      projectName: 'Cow mythos realized',
      startDate: new Date('2010-02-20'),
      endDate: new Date('2019-11-01'),
      status: 'Active',
      oapCompliance: "No"
    });

    let grant3 = store.createRecord('grant', {
      projectName: 'Datanet: Conserving cow data',
      awardNumber: 'P30 CD340212',
      startDate: new Date('2010-03-12'),
      endDate: new Date('2015-08-10'),
      status: 'Ended',
      oapCompliance: "No"
    });

    let grant4 = store.createRecord('grant', {
      projectName: 'Trees in the woods',
      awardNumber: 'U01 CA130322',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2019-09-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });

    let grant5 = store.createRecord('grant', {
      projectName: 'Leafy trees',
      awardNumber: 'R21 DK098988',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2014-02-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });

    let grant6 = store.createRecord('grant', {
      projectName: 'Life on the beach: animal edition',
      awardNumber: 'R21 AI939322',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant7 = store.createRecord('grant', {
      projectName: 'grant7',
      awardNumber: 'R20 AI939212',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant8 = store.createRecord('grant', {
      projectName: 'grant8',
      awardNumber: 'AQ 11',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant9 = store.createRecord('grant', {
      projectName: 'grant9',
      awardNumber: 'MX11-1131',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant10 = store.createRecord('grant', {
      projectName: 'grant 10',
      awardNumber: 'LIT-123123',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant11 = store.createRecord('grant', {
      projectName: 'grant11',
      awardNumber: 'AUX012121',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant12 = store.createRecord('grant', {
      projectName: 'grant12',
      awardNumber: 'NNI-2311',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
    });
    let grant13 = store.createRecord('grant', {
      projectName: 'grant13',
      awardNumber: 'R21 AI939322',
      startDate: new Date('2010-03-04'),
      endDate: new Date('2015-08-10'),
      status: 'Active',
      oapCompliance: "Yes"
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

    let objects = [user1, user2, user3, user4,
      funder1, funder2, funder3,
      grant1, grant2, grant3, grant4, grant5, grant6,
      grant7, grant8, grant9, grant10, grant11, grant12,
      sub1, sub2, sub3, sub4,
      coeus1, coeus2, coeus3, coeus4, coeus5, coeus6,
      coeus7, coeus8, coeus9, coeus12, coeus10, coeus11, coeus14,
      person1, person2, person3, person4, person5, person6, person7, person8,
      person9, person10,person11, person12, person13];

    return RSVP.all(objects.map(o => o.save())).then(() => {
      grant1.set('creator', user1);
      grant2.set('creator', user2);
      grant3.set('creator', user3);
      grant4.set('creator', user1);
      grant5.set('creator', user2);
      grant6.set('creator', user3);
      grant7.set('creator', user1);
      grant8.set('creator', user2);
      grant9.set('creator', user3);
      grant10.set('creator', user1);
      grant11.set('creator', user2);
      grant13.set('creator', user3);
      grant12.set('creator', user3);

      grant1.set('funder', funder1);
      grant2.set('funder', funder1);
      grant3.set('funder', funder2);
      grant4.set('funder', funder1);
      grant5.set('funder', funder3);
      grant6.set('funder', funder2);
      grant7.set('funder', funder1);
      grant8.set('funder', funder3);
      grant9.set('funder', funder2);
      grant10.set('funder', funder3);
      grant11.set('funder', funder1);
      grant12.set('funder', funder2);
      grant13.set('funder', funder2);

      grant1.set('externalId', coeus1);
      grant2.set('externalId', coeus2);
      grant3.set('externalId', coeus3);
      grant4.set('externalId', coeus4);
      grant5.set('externalId', coeus5);
      grant6.set('externalId', coeus6);
      grant7.set('externalId', coeus7);
      grant8.set('externalId', coeus8);
      grant9.set('externalId', coeus9);
      grant10.set('externalId', coeus10);
      grant11.set('externalId', coeus11);
      grant12.set('externalId', coeus12);
      grant13.set('externalId', coeus11);

      grant1.set('pi', person1);
      grant1.get('copis').pushObject(person2);

      grant2.set('pi', person2);

      grant3.set('pi', person3);
      grant3.get('copis').pushObject(person4);

      grant4.set('pi', person5);
      grant4.get('copis').pushObject(person6);
      grant5.get('copis').pushObject(person12);
      grant5.get('copis').pushObject(person13);


      grant5.set('pi', person7);
      grant5.get('copis').pushObject(person8);
      grant5.get('copis').pushObject(person11);

      grant6.set('pi', person9);
      grant6.get('copis').pushObject(person10);

      grant7.set('pi', person12);
      grant7.get('copis').pushObject(person2);

      grant8.set('pi', person2);

      grant9.set('pi', person3);
      grant9.get('copis').pushObject(person4);

      grant10.set('pi', person5);
      grant10.get('copis').pushObject(person6);
      grant10.get('copis').pushObject(person12);
      grant10.get('copis').pushObject(person13);

      grant11.set('pi', person7);
      grant11.get('copis').pushObject(person8);
      grant11.get('copis').pushObject(person11);

      grant12.set('pi', person9);
      grant12.get('copis').pushObject(person10);

      grant13.set('pi', person12);
      grant13.get('copis').pushObject(person13);

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

      grant4.get('submissions').pushObject(sub1);
      grant4.get('submissions').pushObject(sub2);
      sub1.get('grants').pushObject(grant4);

      grant5.get('submissions').pushObject(sub2);
      grant5.get('submissions').pushObject(sub3);
      sub2.get('grants').pushObject(grant5);
      sub2.get('grants').pushObject(grant5);

      grant6.get('submissions').pushObject(sub4);
      sub4.get('grants').pushObject(grant6);

      grant7.get('submissions').pushObject(sub2);
      grant7.get('submissions').pushObject(sub3);
      sub2.get('grants').pushObject(grant7);
      sub3.get('grants').pushObject(grant7);

      grant8.get('submissions').pushObject(sub4);
      sub4.get('grants').pushObject(grant8);

      grant9.get('submissions').pushObject(sub1);
      grant9.get('submissions').pushObject(sub2);
      sub1.get('grants').pushObject(grant9);

      grant10.get('submissions').pushObject(sub2);
      grant10.get('submissions').pushObject(sub3);
      sub2.get('grants').pushObject(grant10);
      sub2.get('grants').pushObject(grant10);

      grant11.get('submissions').pushObject(sub4);
      sub4.get('grants').pushObject(grant11);

      return RSVP.all(objects.map(o => o.save())).then(() => {
        return this.controllerFor('application').get('session').login('admin');
      })
    });
  }
});
