import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import RSVP from 'rsvp';

const {
  service
} = Ember.inject;

export default Route.extend(ApplicationRouteMixin, {
  session: service(),
  currentUser: service(),

  /* Used as route-action in templates */
  actions: {
    back() {
      history.back();
    },
    transitionTo(route, model) {
      this.transitionTo(route, model);
    },
  },
  beforeModel() {
    return this._loadCurrentUser();
  },
  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentUser();
  },
  _loadCurrentUser() {
    return this.get('currentUser').load().catch((e) => {
      this.get('session').invalidate();
    });
  },
  model() {
    const store = this.get('store');
    // temp jhuInstitution move out or remove later

    const jhuInstitution = {
      name: 'Johns Hopkins University',
      primaryColor: '#002D72',
      secondaryColor: 'black',
      tertiaryColor: '#f7f7f2',
      logo: 'https://image.ibb.co/iWgHXx/university_logo_small_vertical_white_no_clear_space_29e2bdee83.png',
      schema: [],
    };

    const users = [
      {
        username: 'eford',
        displayName: 'Ernest Ford',
        email: 'ford@example.com',
        roles: ['submitter']
      },
      {
        username: 'agudzun',
        displayName: 'Anne Gudzune',
        email: 'anne@example.com',
        roles: ['sumbitter']
      },
      {
        username: 'spillage',
        displayName: 'Stephen Pillage',
        email: 'illage@example.com',
        roles: ['submitter']
      },
      {
        username: 'efrey',
        displayName: 'Eric Frey',
        email: 'frey@example.com',
        roles: ['submitter']
      },
      {
        username: 'mjaco',
        displayName: 'Michael Jacobs',
        email: 'mjacob@example.com',
        roles: ['submitter']
      },
      {
        username: 'jwong',
        displayName: 'John Wong',
        email: 'jwong@example.com',
        roles: ['submitter']
      },
      {
        username: 'tbrown',
        displayName: 'Tiffany Brown',
        email: 'tbrown@example.com',
        roles: ['submitter']
      },
      {
        username: 'hpeek',
        displayName: 'Hillary Peek',
        email: 'peek@example.com',
        roles: ['submitter']
      },
      {
        username: 'plimo',
        displayName: 'Steve Plimpton',
        email: 'plimo@example.com',
        roles: ['submitter']
      },
      {
        username: 'zwang',
        displayName: 'Szu Wang',
        email: 'zwang@example.com',
        roles: ['submitter']
      },
      {
        username: 'ksand',
        displayName: 'Kurt Sanders',
        email: 'ksand@example.com',
        roles: ['submitter']
      },
      {
        username: 'bradley',
        displayName: 'Robert Bradley',
        email: 'bradley@example.com',
        roles: ['submitter']
      },
      {
        username: 'elewin',
        displayName: 'Erin Lewin',
        email: 'elewin@example.com',
        roles: ['submitter']
      },
      {
        username: 'sayeed.choudhury',
        displayName: 'Sayeed Choudhury',
        email: 'schou@example.com',
        roles: ['admin']
      },
      {
        username: 'hvu',
        displayname: 'Hanh Vu',
        email: 'hvu@example.com',
        roles: ['submitter']
      },
      {
        username: 'rkelly',
        displayName: 'Kelly R Fisher',
        email: 'r.kelly@example.com',
        roles: ['submitter']
      },
      {
        username: 'tmac',
        displayName: 'Thomas McDermott',
        email: 'mcdott@example.com',
        roles: ['submitter']
      },
      {
        username: 'shatsu',
        displayName: 'Sharon Tsui',
        email: 'sharon.tsui@example.com',
        roles: ['submitter']
      },
      {
        username: 'maciver',
        displayName: 'Martha Mac Iver',
        email: 'martha.mac@example.com',
        roles: ['submitter']
      },
      {
        username: 'mirosen',
        displayName: 'Michael Rosenberg',
        email: 'michael.rosenberg@example.com',
        roles: ['submitter']
      },
      {
        username: 'jfauerbach',
        displayName: 'James Fauerbach',
        email: 'jfauerbach@example.com',
        roles: ['sumbitter']
      }
    ];
    const repos = [
      {
        name: 'PubMed Central',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/'
      },
      {
        name: 'National Science Foundation Public Access Repository',
        url: 'https://par.nsf.gov/'
      },
      {
        name: 'Johns Hopkins JScholarship',
        url: 'https://jscholarship.library.jhu.edu/'
      },
      {
        name: 'Educational Resources Information Center (ERIC)',
        url: 'https://eric.ed.gov/'
      }
    ];
    const policies = [
      {
        title: 'National Institute of Health Pulic Access Policy',
        policyUrl: 'https://publicaccess.nih.gov/policy.htm',
        description: `The Director of the National Institutes of Health requires that all 
        investigators funded by the NIH submit or have submitted for them to the National 
        Library of Medicine's PubMed Central an electronic version of their final, peer-reviewed 
        manuscripts upon acceptance for publication, to be made publicly available no later 
        than 12 months after the official date of publication: Provided, that the NIH shall 
        implement the public access policy in a manner consistent with copyright law.`
      },
      {
        title: 'National Science Foundation Public Access Policy'
      },
      {
        title: 'Johns Hopkins Open Access Policy'
      },
      {
        title: 'Department of Education IES Policy Regarding Public Access to Research'
      }
    ];
    const funders = [
      {
        name: 'National Eye Institute',
        url: 'https://nei.nih.gov/',
        localKey: '1234lkj'
      },
      {
        name: 'National Science Foundation',
        url: 'https://www.nsf.gov/',
        localKey: 'nsf'
      },
      {
        name: 'National Institution of Diabetes and Digestion',
        url: 'https://www.niddk.nih.gov/',
        localKey: 'niddk-nih'
      },
      {
        name: 'National Institute of Mental Health',
        url: 'https://www.nimh.nih.gov/index.shtml',
        localKey: 'nimh-nih'
      },
      {
        name: 'National Institute of Health',
        url: 'https://www.nih.gov/',
        localKey: 'nih'
      },
      {
        name: 'Institute of Education Sciences',
        url: 'https://ies.ed.gov/',
        localKey: 'ies-ed'
      }
    ];
    const grants = [
      {
        id: 0,
        awardNumber: 'R01EY027824',
        projectName: 'Regulation of blood-retinal barrier by placental growth factor.',
        startDate: new Date('2017-04-01'),
        endDate: new Date('2022-03-31'),
        awardStatus: 'Active',
        localKey: '16129769',
      },
      {
        id: 1,
        awardNumber: 'R01DK110366',
        projectName: 'Identification and Activation Mechanisms of Vagal and Spinal Nociceptors in Esophageal Mucosa',
        startDate: new Date('2017-08-01'),
        endDate: new Date('2021-07-31'),
        awardStatus: 'Active',
        localKey: '16120629',
      },
      {
        id: 2,
        projectName: 'Optimal magnification and oculomotor strategies in low vision patients',
        awardNumber: 'R01EY026617',
        startDate: new Date('2017-06-01'),
        endDate: new Date('2020-05-31'),
        awardStatus: 'Active',
        localKey: '16120539',
      },
      {
        id: 3,
        projectName: 'UCure urethral strictures',
        awardNumber: '1640778',
        startDate: new Date('2016-06-01'),
        endDate: new Date('2017-12-31'),
        awardStatus: 'Active',
        localKey: '16120469',
      },
      {
        id: 4,
        projectName: 'Psychiatric Epidemiology Training Program',
        awardNumber: 'T32MH014592',
        startDate: new Date('2016-07-01'),
        endDate: new Date('2017-06-30'),
        awardStatus: 'Terminated',
        localKey: '16120459',
      },
      {
        id: 5,
        projectName: 'Neurologic Sequelae of HIV Subtype A and D Infection and ART Rakai Uganda',
        awardNumber: 'T32MH019545',
        startDate: new Date('2016-07-01'),
        endDate: new Date('2018-06-30'),
        awardStatus: 'Active',
        localKey: '16120169',
      },
      {
        id: 6,
        projectName: 'GEM:  RESPONSE OF GLOBAL IONOSPHERIC CURRENTS TO SUBSTORMS:  IMPLICATION FOR THE ELECTRIC FIELD PENETRATION TO THE INNER MAGNETOSPHERE',
        awardNumber: '1502700',
        startDate: new Date('2016-05-15'),
        endDate: new Date('2019-04-30'),
        awardStatus: 'Active',
        localKey: '1204023',
      },
      {
        id: 7,
        projectName: 'Fogarty African Bioethics Consortium Post-Doctoral Fellowship Program',
        awardNumber: 'D43TW010512',
        startDate: new Date('2017-06-01'),
        endDate: new Date('2022-05-31'),
        awardStatus: 'Active',
        localKey: '16119319',
      },
      {
        id: 8,
        projectName: 'CAREER: DNA-Templated Assembly of Nanoscale Circuit Interconnects',
        awardNumber: 'CMMI-1253876',
        startDate: new Date('2013-01-01'),
        endDate: new Date('2017-12-31'),
        awardStatus: 'Active',
        localKey: '16119219',
      },
      {
        id: 9,
        projectName: 'Neurologic Sequelae of HIV Subtype A and D Infection and ART Rakai Uganda',
        awardNumber: 'R01MH099733',
        startDate: new Date('2016-03-01'),
        endDate: new Date('2018-02-28'),
        awardStatus: 'Active',
        localKey: '16118979',
      },
      {
        id: 10,
        projectName: 'Telomere maintenance by the telomerase RNA-protein complex',
        awardNumber: 'R01GM118757',
        startDate: new Date('2018-03-04'),
        endDate: new Date('2020-08-10'),
        awardStatus: 'Active',
        localKey: '16108389',
      },
      {
        id: 11,
        projectName: 'Genetics of Fuchs Corneal Dystrophy',
        awardNumber: 'R01EY016835',
        startDate: new Date('2017-03-04'),
        endDate: new Date('2018-08-10'),
        awardStatus: 'Active',
      },
      {
        id: 12,
        projectName: 'P-Adic and Mod P Galois Representations',
        awardNumber: '1564367',
        startDate: new Date('2015-03-04'),
        endDate: new Date('2017-08-10'),
        awardStatus: 'Terminated',
        localKey: '16086889',
      },
      {
        id: 13,
        awardNumber: 'R305A170411',
        localKey: '126699',
        projectName: 'Developing a Spacially-enhanced Elementary Curriculum and Teacher Training Series to Improve Science Advancement',
        startDate: new Date('2017-07-01'),
        endDate: new Date('2021-06-30'),
        awardStatus: 'active',
      },
      {
        id: 14,
        awardNumber: '90073719',
        localKey: '126257',
        projectName: 'FY18 Title IV Award',
        startDate: new Date('2017-07-01'),
        endDate: new Date('2018-06-30'),
        awardStatus: 'active',
      },
      {
        id: 15,
        awardNumber: '',
        localKey: '122761',
        projectName: 'FY17 Federal Work Study',
        startDate: new Date('2016-06-30'),
        endDate: new Date('2017-06-30'),
        awardStatus: 'terminated',
      },
      {
        id: 16,
        awardNumber: 'P022A150076',
        localKey: '123526',
        projectName: 'How Do We Provide High Quality HIV Care and Treatment When THere Are Too Few Health Care Providers in Uganda',
        startDate: new Date('2015-09-30'),
        endDate: new Date('2017-05-31'),
        awardStatus: 'terminated',
      },
      {
        id: 17,
        awardNumber: 'R305H150081',
        localKey: '120443',
        projectName: 'Continuous Improvement in Schools Equipping Families to Support Students in the Transition to High School',
        startDate: new Date('2015-07-01'),
        endDate: new Date('2019-06-30'),
        awardStatus: 'active',
      },
      {
        id: 18,
        awardNumber: 'H325T090027',
        localKey: '105336',
        projectName: 'The Johns Hopkins Universtiy Secondary Support Initiative (JHUSSI)',
        startDate: new Date('2009-01-01'),
        endDate: new Date('2016-06-30'),
        awardStatus: 'terminated',
      },
      {
        id: 19,
        awardNumber: 'H133A070045',
        localKey: '101950',
        projectName: 'Johns Hopkins University Burn Injury Model System',
        startDate: new Date('2010-10-01'),
        endDate: new Date('2014-03-31'),
        awardStatus: 'terminated',
      }
    ];
    const journals = [
      {
        journalName: 'AAPS Journal',
        nlmta: 'AAPS J',
        pmcParticipation: 'A'
      },
      {
        name: 'ACS Medicinal Chemistry Letters',
        nlmta: 'ACS Med Chem Lett',
        pmcParticipation: 'A'
      },
      {
        name: 'AAPS PharmSci',
        nlmta: 'AAPS PharmSci',
        pmcParticipation: 'A'
      },
      {
        name: 'Food & Function',
        nlmta: 'Food Funct',
        pmcParticipation: 'B'
      },
      {
        name: 'Toxicology Research',
        nlmta: 'Toxicol Res',
        pmcParticipation: 'B'
      },
      {
        name: 'Analyst',
        nlmta: 'Analyst',
        pmcParticipation: 'B'
      },
      {
        name: 'Physical Review Fluids'
      },
      {
        name: 'Advances in Engineering Education'
      }
    ];
    const submissions = [
      {
        
      }
    ];

    let userDB = [];
    let repoDB = [];
    let policyDB = [];
    let funderDB = [];
    let grantDB = [];
    let journalDB = [];

    users.forEach(u => userDB.push(store.createRecord('user', u)));
    repos.forEach(r => repoDB.push(store.createRecord('repository', r)));
    policies.forEach(p => policyDB.push(store.createRecord('policy', p)));
    funders.forEach(f => funderDB.push(store.createRecord('funder', f)));
    grants.forEach(g => grantDB.push(store.createRecord('grant', g)));
    journals.forEach(j => journalDB.push(store.createRecord('journal', j)));

    let moo = [
      ...userDB,
      ...repoDB,
      ...policyDB,
      ...funderDB,
      ...grantDB,
      ...journalDB
    ];

    RSVP.all(moo.map(o => o.save())).then(() => {
      policyDB[0].set('repository', repoDB[0]);
      policyDB[1].set('repository', repoDB[1]);
      policyDB[2].set('repository', repoDB[2]);
      policyDB[3].set('repository', repoDB[3]);

      funderDB[0].set('policy', policyDB[0]);
      funderDB[1].set('policy', policyDB[1]);
      funderDB[2].set('policy', policyDB[0]);
      funderDB[3].set('policy', policyDB[0]);
      funderDB[4].set('policy', policyDB[0]);
      funderDB[5].set('policy', policyDB[3]);

      grantDB[0].set('pi', userDB[1]);
      grantDB[0].get('coPis').pushObject(userDB[0]);
      grantDB[0].set('directFunder', funderDB[0]);
      grantDB[0].set('primaryFunder', funderDB[0]);
      grantDB[1].set('pi', userDB[1]);
      grantDB[1].set('directFunder', funderDB[2]);
      grantDB[1].set('primaryFunder', funderDB[2]);
      grantDB[2].set('pi', userDB[2]);
      grantDB[2].get('coPis').pushObject(userDB[3]);
      grantDB[2].set('directFunder', funderDB[0]);
      grantDB[2].set('primaryFunder', funderDB[0]);
      grantDB[3].set('pi', userDB[4]);
      [userDB[5], userDB[11], userDB[12]].forEach(u => grantDB[3].get('coPis').pushObject(u));
      grantDB[3].set('directFunder', funderDB[1]);
      grantDB[3].set('primaryFunder', funderDB[1]);
      grantDB[4].set('pi', userDB[6]);
      [userDB[7], userDB[10]].forEach(u => grantDB[4].get('coPis').pushObject(u));
      grantDB[4].set('directFunder', funderDB[3]);
      grantDB[4].set('primaryFunder', funderDB[3]);
      grantDB[5].set('pi', userDB[8]);
      grantDB[5].get('coPis').pushObject(userDB[9]);
      grantDB[5].set('directFunder', funderDB[4]);
      grantDB[5].set('primaryFunder', funderDB[4]);
      grantDB[6].set('pi', userDB[11]);
      grantDB[6].get('coPis').pushObject(userDB[1]);
      grantDB[6].set('directFunder', funderDB[1]);
      grantDB[6].set('primaryFunder', funderDB[1]);
      grantDB[7].set('pi', userDB[1]);
      grantDB[7].set('directFunder', funderDB[4]);
      grantDB[7].set('primaryFunder', funderDB[4]);
      grantDB[8].set('pi', userDB[2]);
      grantDB[8].get('coPis').pushObject(userDB[3]);
      grantDB[8].set('directFunder', funderDB[1]);
      grantDB[8].set('primaryFunder', funderDB[1]);
      grantDB[9].set('pi', userDB[4]);
      [userDB[5], userDB[11], userDB[12]].forEach(u => grantDB[9].get('coPis'));
      grantDB[9].set('directFunder', funderDB[4]);
      grantDB[9].set('primaryFunder', funderDB[4]);
      grantDB[10].set('pi', userDB[6]);
      [userDB[7], userDB[10]].forEach(u => grantDB[10].get('coPis').pushObject(u));
      grantDB[10].set('directFunder', funderDB[4]);
      grantDB[10].set('primaryFunder', funderDB[4]);
      grantDB[11].set('pi', userDB[9]);
      grantDB[11].get('coPis').pushObject(userDB[9]);
      grantDB[11].set('directFunder', funderDB[0]);
      grantDB[11].set('primaryFunder', funderDB[0]);
      grantDB[12].set('pi', userDB[1]);
      grantDB[12].get('coPis').pushObject(userDB[12]);
      grantDB[12].set('directFunder', funderDB[1]);
      grantDB[12].set('primaryFunder', funderDB[1]);
      grantDB[13].set('pi', userDB[15]);
      grantDB[13].set('directFunder', funderDB[5]);
      grantDB[13].set('primaryFunder', funderDB[5]);
      grantDB[14].set('pi', userDB[16]);
      grantDB[14].set('directFunder', funderDB[5]);
      grantDB[14].set('primaryFunder', funderDB[5]);
      grantDB[15].set('pi', userDB[16]);
      grantDB[15].set('directFunder', funderDB[5]);
      grantDB[15].set('primaryFunder', funderDB[5]);
      grantDB[16].set('pi', userDB[17]);
      grantDB[16].set('directFunder', funderDB[5]);
      grantDB[16].set('primaryFunder', funderDB[5]);
      grantDB[17].set('pi', userDB[18]);
      grantDB[17].set('directFunder', funderDB[5]);
      grantDB[17].set('primaryFunder', funderDB[5]);
      grantDB[18].set('pi', userDB[19]);
      grantDB[18].set('directFunder', funderDB[5]);
      grantDB[18].set('primaryFunder', funderDB[5]);
      grantDB[19].set('pi', userDB[20]);
      grantDB[19].set('directFunder', funderDB[5]);
      grantDB[19].set('primaryFunder', funderDB[5]);

      return RSVP.all(moo.map(o => o.save())).then(() => jhuInstitution);
    });
  },
});
