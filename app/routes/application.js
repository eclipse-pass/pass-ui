import Route from '@ember/routing/route';

// For development purposes, store is seeded with objects

export default Route.extend({
  model() {
    // Add users
    this.get('store').push({
      data: [{
        id: 1,
        type: 'user',
        attributes: {
          username: 'admin'
        },
        relationships: {}
      }, {
        id: 2,
        type: 'user',
        attributes: {
          username: 'bessie'
        },
        relationships: {}       
      }, {
        id: 3,
        type: 'user',
        attributes: {
          username: 'farmerbob'
        },
        relationships: {}
      }]
    });

    // Add grants
    this.get('store').push({
      data: [{
        id: 1,
        type: 'grant',
        attributes: {
          number: '0xDEADBEAF',
          agency: 'NIH',
          title: 'Better Ice Cream',
          start_date: '2015-03-25',
          end_date: '2018-06-02',
          status: 'in progress'
        },
        relationships: {
          creator: {
            data: {
              id: 1,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 1,
              type: 'submission'
            }
          }, {
            data: {
              id: 2,
              type: 'submission'
            }
          }]
        }
      }, {
        id: 2,
        type: 'grant',
        attributes: {
          number: '1231asd23',
          title: 'Cow mythos realized',
          agency: 'NCA',
          start_date: '2010-02-20',
          end_date: '2019-11-01',
          status: 'in progress'
        },
        relationships: {
          creator: {
            data: {
              id: 2,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 2,
              type: 'submission'
            }
          }, {
            data: {
              id: 3,
              type: 'submission'
            }
          }]
        }
      }, {
        id: 3,
        type: 'grant',
        attributes: {
          title: 'Datanet: Conserving cow data',
          agency: 'NSF',
          start_date: '2010-03-12',
          end_date: '2015-08-10',
          status: 'complete'
        },
        relationships: {
          creator: {
            data: {
              id: 3,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 4,
              type: 'submission'
            }
          }]
        }
      }]
    });

    // Add submissions
    this.get('store').push({
      data: [{
        id: 1,
        type: 'submission',
        attributes: {
          title: 'Chocolate chip is the best',
          creation_date: '2018-06-02',
          status: 'in progress'
        },
        relationships: {
          creator: {
            data: {
              id: 1,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 1,
              type: 'submission'
            }
          }]
        }
      }, {
        id: 2,
        type: 'submission',
        attributes: {
          title: 'In defense of vanilla',
          creation_date: '2018-06-02',
          status: 'in progress'
        },
        relationships: {
          creator: {
            data: {
              id: 2,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 1,
              type: 'submission'
            }
          }, {
            data: {
              id: 2,
              type: 'submission'
            }
          }]          
        }
      }, {
        id: 3,
        type: 'submission',
        attributes: {
          title: 'Chocolate, how can you go wrong?',
          creation_date: '2018-06-02',
          status: 'in progress'
        },
        relationships: {
          creator: {
            data: {
              id: 2,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 2,
              type: 'submission'
            }
          }]
        }
      }, {
        id: 4,
        type: 'submission',
        attributes: {
          title: 'Animal farm: The prophecy comes true.',
          creation_date: '2018-06-02',
          status: 'complete'
        },
        relationships: {
          creator: {
            data: {
              id: 3,
              type: 'user'
            }
          }, submissions: [{
            data: {
              id: 3,
              type: 'grant'
            }
          }]
        }
      }]
    });
  } 
});
