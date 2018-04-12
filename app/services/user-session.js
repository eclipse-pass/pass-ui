import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { equal, notEmpty } from '@ember/object/computed';
import RSVP from 'rsvp';

// Simple service to authenticate a user with basic auth.
// The user must also exist as a User object in the store.

export default Service.extend({
  user: null,
  authenticated: notEmpty('user', null).readOnly(),
  isAdmin: equal('user.role', 'admin').readOnly(),
  isPI: equal('user.role', 'pi').readOnly(),

  store: service(),

  // Attempt to login with given credentials
  // Return a Promise which will resolve to the specified user on success
  // and undefined if the user does not exist.
  login(username, password) {
    this.set('user', null);

    // Ensure that empty username matches nothing
    if (!username || username.trim().length == 0) {
      return new RSVP.Promise(() => undefined);
    }

    let store = this.get('store');
    let adapter = store.adapterFor('application')

    adapter.set('username', username);
    adapter.set('password', password);

    // First attempt to login with Basic auth.
    // If successfull and test objects are not loaded, load test objects
    // Finally check to make sure user is in store

    return store.findAll('user').then(users => {

      if (users.get('length') == 0) {
        return this.createTestData().then(() => store.findAll('user'));
      } else {

        return users;
      }
    }).then(users => {
      let match = users.find(user => user.get('username') === username);
      if (match) {
        this.set('user', match);
      }
    });
  },

  logout() {
    this.set('user', null);
  },

  // Return a promise to create the test data
  createTestData() {

      // Create the test objects without relationships
    let store = this.get('store');

    let user1 = store.createRecord('user', {
      username: 'admin',
      role: 'admin'
    });

    let user2 = store.createRecord('user', {
      username: 'agudzun',
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
        name: 'National Eye Institute',
        repo: 'PMC'
    });

    let funder2 = store.createRecord('funder', {
        name: 'National Science Foundation',
        repo: 'NSF-PAR'
    });

    let funder3 = store.createRecord('funder', {
        name: 'National Inst Of Diabetes And Digestion',
        repo: 'PMC'
    });

    let funder4 = store.createRecord('funder', {
        name: 'National Inst of Mental Health',
        repo: 'PMC'
    });

    let funder5 = store.createRecord('funder', {
        name: 'National Institute of Health',
        repo: 'PMC'
    });

    // let coeus14 = store.createRecord('identifier', {
    //     label: '16075399'
    // });

    let person1 = store.createRecord('person', {
        displayName: 'Ernest Ford',
        email: 'ford@example.com'
    });

    let person2 = store.createRecord('person', {
        displayName: 'Anne Gudzune',
        email: 'anne@example.com'
    });

    let person3 = store.createRecord('person', {
        displayName: 'Stephen Pillage',
        email: 'illage@example.com'
    });

    let person4 = store.createRecord('person', {
        displayName: 'Eric Frey',
        email: 'frey@example.com'
    });

    let person5 = store.createRecord('person', {
      displayName: 'Michael Jacobs',
      email: 'mjacobe@example.com'
    });

    let person6 = store.createRecord('person', {
      displayName: 'John Wong',
      email: 'wongj@jhu.edu'
    });

    let person7 = store.createRecord('person', {
      displayName: 'Tiffany Brown',
      email: 'tbrown@jhu.edu'
    });
    let person8 = store.createRecord('person', {
      displayName: 'Hillary Peek',
      email: 'peek@jhu.edu'
    });
    let person9 = store.createRecord('person', {
      displayName: 'Steve Plimpton',
      email: 'plimpton@jhu.edu'
    });
    let person10 = store.createRecord('person', {
      displayName: 'Szu Wang',
      email: 'swang@jhu.edu'
    });
    let person11 = store.createRecord('person', {
      displayName: 'Kurt Sanders',
      email: 'sanders@jhu.edu'
    });
    let person12 = store.createRecord('person', {
      displayName: 'Robert Bradley',
      email: 'bradley@jhu.edu'
    });
    let person13= store.createRecord('person', {
      displayName: 'Erin Lewin',
      email: 'elewin@jhu.edu'
    });

    let grant1 = store.createRecord('grant', {
      awardNumber: 'R01EY027824',
      projectName: 'Regulation of blood-retinal barrier by placental growth factor.',
      startDate: new Date('2017-04-01'),
      endDate: new Date('2022-03-31'),
      awardStatus: 'Active',
      oapCompliance: 'No',
      localAwardId: '16129769'
    });

    let grant2 = store.createRecord('grant', {
      awardNumber: 'R01DK110366',
      projectName: 'Identification and Activation Mechanisms of Vagal and Spinal Nociceptors in Esophageal Mucosa',
      startDate: new Date('2017-08-01'),
      endDate: new Date('2021-07-31'),
      awardStatus: 'Active',
      oapCompliance: 'No',
      localAwardId: '16120629'
    });

    let grant3 = store.createRecord('grant', {
      projectName: 'Optimal magnification and oculomotor strategies in low vision patients',
      awardNumber: 'R01EY026617',
      startDate: new Date('2017-06-01'),
      endDate: new Date('2020-05-31'),
      awardStatus: 'Active',
      oapCompliance: 'No',
      localAwardId: '16120539'
    });

    let grant4 = store.createRecord('grant', {
      projectName: 'UCure urethral strictures',
      awardNumber: '1640778',
      startDate: new Date('2016-06-01'),
      endDate: new Date('2017-12-31'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16120469'
    });

    let grant5 = store.createRecord('grant', {
      projectName: 'Psychiatric Epidemiology Training Program',
      awardNumber: 'T32MH014592',
      startDate: new Date('2016-07-01'),
      endDate: new Date('2017-06-30'),
      awardStatus: 'Terminated',
      oapCompliance: 'Yes',
      localAwardId: '16120459'
    });

    let grant6 = store.createRecord('grant', {
      projectName: 'Neurologic Sequelae of HIV Subtype A and D Infection and ART Rakai Uganda',
      awardNumber: 'T32MH019545',
      startDate: new Date('2016-07-01'),
      endDate: new Date('2018-06-30'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16120169'
    });
    let grant7 = store.createRecord('grant', {
      projectName: 'GEM:  RESPONSE OF GLOBAL IONOSPHERIC CURRENTS TO SUBSTORMS:  IMPLICATION FOR THE ELECTRIC FIELD PENETRATION TO THE INNER MAGNETOSPHERE',
      awardNumber: '1502700',
      startDate: new Date('2016-05-15'),
      endDate: new Date('2019-04-30'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '1204023'
    });

    let grant8 = store.createRecord('grant', {
      projectName: 'Fogarty African Bioethics Consortium Post-Doctoral Fellowship Program',
      awardNumber: 'D43TW010512',
      startDate: new Date('2017-06-01'),
      endDate: new Date('2022-05-31'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16119319'
    });
    let grant9 = store.createRecord('grant', {
      projectName: 'CAREER: DNA-Templated Assembly of Nanoscale Circuit Interconnects',
      awardNumber: 'CMMI-1253876',
      startDate: new Date('2013-01-01'),
      endDate: new Date('2017-12-31'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16119219'
    });
    let grant10 = store.createRecord('grant', {
      projectName: 'Neurologic Sequelae of HIV Subtype A and D Infection and ART Rakai Uganda',
      awardNumber: 'R01MH099733',
      startDate: new Date('2016-03-01'),
      endDate: new Date('2018-02-28'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16118979'
    });
    let grant11 = store.createRecord('grant', {
      projectName: 'Telomere maintenance by the telomerase RNA-protein complex',
      awardNumber: 'R01GM118757',
      startDate: new Date('2018-03-04'),
      endDate: new Date('2020-08-10'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16108389'
    });
    let grant12 = store.createRecord('grant', {
      projectName: 'Genetics of Fuchs Corneal Dystrophy',
      awardNumber: 'R01EY016835',
      startDate: new Date('2017-03-04'),
      endDate: new Date('2018-08-10'),
      awardStatus: 'Active',
      oapCompliance: 'Yes',
      localAwardId: '16097079'
    });
    let grant13 = store.createRecord('grant', {
      projectName: 'P-Adic and Mod P Galois Representations',
      awardNumber: '1564367',
      startDate: new Date('2015-03-04'),
      endDate: new Date('2017-08-10'),
      awardStatus: 'Terminated',
      oapCompliance: 'Yes',
      localAwardId: '16086889'
    });

    let deposit1 = store.createRecord('deposit', {
      updatedDate: new Date('2016-04-02'),
      status: 'Submitted',
      assignedId: '775054',
      accessUrl: '',
    });

    let deposit2 = store.createRecord('deposit', {
      updatedDate: new Date('2015-05-02'),
      status: 'Submitted',
      assignedId: '32654',
      accessUrl: '',
    });

    let deposit3 = store.createRecord('deposit', {
      updatedDate: new Date('2017-05-02'),
      status: 'Submitted',
      assignedId: '659871',
      accessUrl: '',
    });

    let deposit4 = store.createRecord('deposit', {
      updatedDate: new Date('2017-10-02'),
      status: 'Submitted',
      assignedId: '9201038',
      accessUrl: '',
    });

    let deposit5 = store.createRecord('deposit', {
      updatedDate: new Date('2016-10-02'),
      status: 'Submitted',
      assignedId: '0982342',
      accessUrl: '',
    });

    let repo1 = store.createRecord('repository', {
      name: 'PubMed Central',
      description: '',
      url: 'https://www.ncbi.nlm.nih.gov/pmc/'
    });

    let repo2 = store.createRecord('repository', {
      name: 'National Science Foundation Public Access Repository',
      description: '',
      url: 'https://par.nsf.gov/'
    });

    let repo3 = store.createRecord('repository', {
      name: "Johns Hopkins Open Access Repository",
      description: '',
      url: ''
    });

    let sub1 = store.createRecord('submission', {
      title: 'Evaluating the Role of Interdigitated Neoadjuvant Chemotherapy and Radiation in the Management of High-Grade Soft-Tissue Sarcoma: The Johns Hopkins Experience.',
      creationDate: new Date('2016-04-04'),
      updatedDate: new Date('2016-05-04'),
      submittedDate: new Date('2017-07-04'),
      status: 'Submitted',
      // corrAuthorName: 'Ernest Ford',
      // corrAuthorEmail: 'ford@example.com'
    });

    let sub2 = store.createRecord('submission', {
      title: 'Micropattern size-dependent endothelial differentiation from a human induced pluripotent stem cell line.',
      creationDate: new Date('2017-06-02'),
      updatedDate: new Date('2017-12-04'),
      submittedDate: new Date('2017-12-04'),
      status: 'Submitted',
      // corrAuthorName: 'Anne Gudzune',
      // corrAuthorEmail: 'anne@example.com'
    });


    let sub3 = store.createRecord('submission', {
      title: 'Immunomodulatory Drugs: Immune Checkpoint Agents in Acute Leukemia.',
      creationDate: new Date('2017-06-02'),
      updatedDate: new Date('2017-11-04'),
      status: 'In Progress',
      // corrAuthorName: 'Stephen Pillage',
      // corrAuthorEmail: 'illage@example.com'
    });


    let sub4 = store.createRecord('submission', {
      title: 'Family history of alcoholism is related to increased D2 /D3 receptor binding potential: a marker of resilience or risk?',
      creationDate: new Date('2017-06-02'),
      updatedDate: new Date('2017-11-22'),
      status: 'In Progress',
      // corrAuthorName: 'Eric Frey',
      // corrAuthorEmail: 'frey@example.com'
    });

    let publisherA1 = store.createRecord('publisher', {
      name: 'American Chemical Society'
    });

    let publisherA2 = store.createRecord('publisher', {
      name: 'American Association of Pharmaceutical Scientists'
    });

    let publisherB1 = store.createRecord('publisher', {
      name: 'Royal Society of Chemistry'
    });

    // let journalID1 = store.createRecord('identifier', {
    //   type: 'epub',
    //   label: 'ISSN',
    //   uri: '1550-7416'
    // })

    // let journalID2 = store.createRecord('identifier', {
    //   type: 'epub',
    //   label: 'ISSN',
    //   uri: '1948-5875'
    // })

    // let journalID3 = store.createRecord('identifier', {
    //   type: 'epub',
    //   label: 'ISSN',
    //   uri: '1522-1059'
    // })

    // let journalID4 = store.createRecord('identifier', {
    //   type: 'ppub',
    //   label: 'ISSN',
    //   uri: '2042-6496'
    // })

    // let journalID5 = store.createRecord('identifier', {
    //   type: 'epub',
    //   label: 'ISSN',
    //   uri: '2045-4538'
    // })

    // let journalID6 = store.createRecord('identifier', {
    //   type: 'ppub',
    //   label: 'ISSN',
    //   uri: '0003-2654'
    // })

    let journalA1 = store.createRecord('journal', {
      name: 'AAPS Journal',
      nlmta: 'AAPS J',
      pmcParticipation: 'A',
      // issns: ['1550-7416']
    });

    let journalA2 = store.createRecord('journal', {
      name: 'ACS Medicinal Chemistry Letters',
      nlmta: 'ACS Med Chem Lett',
      pmcParticipation: 'A',
      // issns: ['1948-5875']
    });
    //test DOIs for article that was published by this journal
    // 10.1021/acsmedchemlett.7b00397
    // 10.1021/acsmedchemlett.7b00376

    let journalA3 = store.createRecord('journal', {
      name: 'AAPS PharmSci',
      nlmta: 'AAPS PharmSci',
      pmcParticipation: 'A',
      // issns: ['1522-1059']
    });

    let journalB1 = store.createRecord('journal', {
      name: 'Food & Function',
      nlmta: 'Food Funct',
      pmcParticipation: 'B',
      // issns: ['2042-6496']
    });
    //test DOIs for articles that were published by this journal
    // 10.1039/c7fo01251a
    // 10.1039/c7fo01382e


    let journalB2 = store.createRecord('journal', {
      name: 'Toxicology Research',
      nlmta: 'Toxicol Res',
      pmcParticipation: 'B',
      // issns: ['2045-4538']
    });

    let journalB3 = store.createRecord('journal', {
      name: 'Analyst',
      nlmta: 'Analyst',
      pmcParticipation: 'B',
      // issns: ['0003-2654']
    });
    //test DOIs for articles that were published by this journal
    // 10.1039/c7an01256j
    // 10.1039/C7AN01617D

    let policy1 = store.createRecord('policy', {
      title: 'National Institute of Health Public Access Policy',
      description: '',
      isDefault: false
    });

    let policy2 = store.createRecord('policy', {
      title: 'National Science Foundation Public Access Policy',
      description: '',
      isDefault: false
    });

    let policy3 = store.createRecord('policy', {
      title: 'Johns Hopkins Public Access Policy',
      description: '',
      isDefault: true
    });

    // ###################################################################
    // Dept of Education test stuffs
    let user_sayeed = store.createRecord('user', {
      username: '',
      role: 'pi'
    });

    let person_sayeed = store.createRecord('person', {
      displayName: 'Sayeed Choudhury',
      email: 'sayeed@jhu.edu',  // Should I use a fake email?
      affiliation: 'Johns Hopkins University',
      orcid: 'https://orcid.org/0000-0003-2891-0543'
    });

    let funder_edu = store.createRecord('funder', {
      name: 'US Department of Education',
      url: 'https://www.ed.gov/',
    });

    let policy_edu = store.createRecord('policy', {
      title: "Department of Education Public Access Policy",
      description: '',
      isDefault: false,
      // url: 'https://ies.ed.gov/funding/researchaccess.asp',
    });

    let repo_edu = store.createRecord('repository', {
      name: 'Education Resources Information Center',
      url: 'https://eric.ed.gov/',
      description: `ERIC is an internet-based digital library of education research and information sponsored by 
        the Institute of Education Sciences (IES) of the U.S. Department of Education. ERIC provides access to 
        bibliographic records of journal and non-journal literature from 1966 to the present. ERIC's mission is 
        to provide a comprehensive, easy-to-use, searchable Internet-based bibliographic and full-text database 
        of education research and information for educators, researchers, and the general public. `,
    });

    let journal_edu1 = store.createRecord('journal', {
      name: "Advances in Engineering Education"
    });

    let person_edu1 = store.createRecord('person', {
      displayName: 'Kelly R Fisher',
      email: 'r.kelly@example.com'
    });

    let person_edu2 = store.createRecord('person', {
      displayName: 'Thomas McDermott',
      email: 'mcdott@example.com'
    });

    let person_edu3 = store.createRecord('person', {
      displayName: 'Sharon Tsui',
      email: 'sharon.tsui@example.com'
    });

    let person_edu4 = store.createRecord('person', {
      displayName: 'Martha Mac Iver',
      email: 'martha.mac@example.com'
    });

    let person_edu5 = store.createRecord('person', {
      displayName: 'Michael Rosenberg',
      email: 'michael.rosenberg@example.com'
    });

    let person_edu6 = store.createRecord('person', {
      displayName: 'James Fauerbach',
      email: 'jfauerbach@example.com'
    });

    // ----- Dept of Ed grants -------------------------------------------
    let grant_edu1 = store.createRecord('grant', {
      awardNumber: 'R305A170411',
      localAwardId: '126699',
      projectName: 'Developing a Spacially-enhanced Elementary Curriculum and Teacher Training Series to Improve Science Advancement',
      startDate: new Date('2017-07-01'),
      endDate: new Date('2021-06-30'),
      awardStatus: 'active'
    });

    let grant_edu2 = store.createRecord('grant', {
      awardNumber: '90073719',
      localAwardId: '126257',
      projectName: 'FY18 Title IV Award',
      startDate: new Date('2017-07-01'),
      endDate: new Date('2018-06-30'),
      awardStatus: 'active'
    });

    let grant_edu3 = store.createRecord('grant', {
      awardNumber: '',
      localAwardId: '122761',
      projectName: 'FY17 Federal Work Study',
      startDate: new Date('2016-06-30'),
      endDate: new Date('2017-06-30'),
      awardStatus: 'terminated'
    });

    let grant_edu4 = store.createRecord('grant', {
      awardNumber: 'P022A150076',
      localAwardId: '123526',
      projectName: 'How Do We Provide High Quality HIV Care and Treatment When THere Are Too Few Health Care Providers in Uganda',
      startDate: new Date('2015-09-30'),
      endDate: new Date('2017-05-31'),
      awardStatus: 'terminated'
    });

    let grant_edu5 = store.createRecord('grant', {
      awardNumber: 'R305H150081',
      localAwardId: '120443',
      projectName: 'Continuous Improvement in Schools Equipping Families to Support Students in the Transition to High School',
      startDate: new Date('2015-07-01'),
      endDate: new Date('2019-06-30'),
      awardStatus: 'active'
    });

    let grant_edu6 = store.createRecord('grant', {
      awardNumber: 'H325T090027',
      localAwardId: '105336',
      projectName: 'The Johns Hopkins Universtiy Secondary Support Initiative (JHUSSI)',  // Misspelling in 'university' comes from COEUS
      startDate: new Date('2009-01-01'),
      endDate: new Date('2016-06-30'),
      awardStatus: 'terminated'
    });

    let grant_edu7 = store.createRecord('grant', {
      awardNumber: 'H133A070045',
      localAwardId: '101950',
      projectName: 'Johns Hopkins University Burn Injury Model System',
      startDate: new Date('2010-10-01'),
      endDate: new Date('2014-03-31'),
      awardStatus: 'terminated'
    });

    // let grant_edu8 = store.createRecord('grant', {
    //   awardNumber: 'ZZ109Y1465551',
    //   localAwardId: '996330',
    //   projectName: 'Johns Hopkins University - Managing Observer Obscurity (JHU-MOO)',
    //   startDate: new Date('2015-06-01'),
    //   endDate: new Date('2020-06-30'),
    //   awardStatus: 'active'
    // });
    // -------------------------------------------------------------------
    let sub_edu1 = store.createRecord('submission', {
      // status: 'non-compliant-not-started',
      title: 'The Johns Hopkins Universtiy Secondary Support Initiative (JHUSSI)',
      status: 'compliant-complete',
      source: 'pass',
      creationDate: new Date('2016-03-01'),
      submittedDate: new Date('2016-03-01'),
      updatedDate: new Date('2016-04-12')
    });

    // ###################################################################

    // Persist the test objects, add relationships, and then persist again.

    let objects = [user1, user2, user3, user4,
      funder1, funder2, funder3, funder4, funder5,
      grant1, grant2, grant3, grant4, grant5, grant6,
      grant7, grant8, grant9, grant10, grant11, grant12, grant13,
      deposit1, deposit2, deposit3, deposit4, deposit5,
      sub1, sub2, sub3, sub4,
      person1, person2, person3, person4, person5, person6, person7, person8,
      person9, person10,person11, person12, person13,
      journalA1, journalA2, journalA3, journalB1, journalB2, journalB3,
      publisherA1, publisherA2, publisherB1,
      repo1, repo2, repo3,
      policy1, policy2, policy3,
      // Add Dept of Edu here to save them to Fedora
      user_sayeed, person_sayeed, funder_edu, policy_edu, repo_edu,
      person_edu1, person_edu2, person_edu3, person_edu4, person_edu5, person_edu6,
      grant_edu1, grant_edu2, grant_edu3, grant_edu4, grant_edu5, grant_edu6, grant_edu7, //grant_edu8
      sub_edu1, journal_edu1
    ];

    return RSVP.all(objects.map(o => o.save())).then(() => {
      policy1.get('repositories').pushObject(repo1);
      policy2.get('repositories').pushObject(repo2);
      policy3.get('repositories').pushObject(repo3);

      funder1.set('policy', policy1);
      funder2.set('policy', policy2);
      funder3.set('policy', policy1);
      funder4.set('policy', policy1);
      funder5.set('policy', policy1);

      grant1.set('creator', user2);
      grant2.set('creator', user2);
      grant3.set('creator', user3);
      grant4.set('creator', user1);
      grant5.set('creator', user4);
      grant6.set('creator', user3);
      grant7.set('creator', user1);
      grant8.set('creator', user2);
      grant9.set('creator', user3);
      grant10.set('creator', user1);
      grant11.set('creator', user3);
      grant12.set('creator', user3);
      grant13.set('creator', user2);

      grant1.set('directFunder', funder1);
      grant2.set('directFunder', funder3);
      grant3.set('directFunder', funder1);
      grant4.set('directFunder', funder2);
      grant5.set('directFunder', funder4);
      grant6.set('directFunder', funder5);
      grant7.set('directFunder', funder2);
      grant8.set('directFunder', funder5);
      grant9.set('directFunder', funder2);
      grant10.set('directFunder', funder5);
      grant11.set('directFunder', funder5);
      grant12.set('directFunder', funder1);
      grant13.set('directFunder', funder2);

      grant1.set('primaryFunder', funder1);
      grant2.set('primaryFunder', funder3);
      grant3.set('primaryFunder', funder1);
      grant4.set('primaryFunder', funder2);
      grant5.set('primaryFunder', funder4);
      grant6.set('primaryFunder', funder5);
      grant7.set('primaryFunder', funder2);
      grant8.set('primaryFunder', funder5);
      grant9.set('primaryFunder', funder2);
      grant10.set('primaryFunder', funder5);
      grant11.set('primaryFunder', funder5);
      grant12.set('primaryFunder', funder1);
      grant13.set('primaryFunder', funder2);

      grant1.set('pi', person2);
      grant1.get('coPis').pushObject(person1);

      grant2.set('pi', person2);

      grant3.set('pi', person3);
      grant3.get('coPis').pushObject(person4);

      grant4.set('pi', person5);
      grant4.get('coPis').pushObject(person6);
      grant4.get('coPis').pushObject(person12);
      grant4.get('coPis').pushObject(person13);


      grant5.set('pi', person7);
      grant5.get('coPis').pushObject(person8);
      grant5.get('coPis').pushObject(person11);

      grant6.set('pi', person9);
      grant6.get('coPis').pushObject(person10);

      grant7.set('pi', person12);
      grant7.get('coPis').pushObject(person2);

      grant8.set('pi', person2);

      grant9.set('pi', person3);
      grant9.get('coPis').pushObject(person4);

      grant10.set('pi', person5);
      grant10.get('coPis').pushObject(person6);
      grant10.get('coPis').pushObject(person12);
      grant10.get('coPis').pushObject(person13);

      grant11.set('pi', person7);
      grant11.get('coPis').pushObject(person8);
      grant11.get('coPis').pushObject(person11);

      grant12.set('pi', person9);
      grant12.get('coPis').pushObject(person10);

      grant13.set('pi', person2);
      grant13.get('coPis').pushObject(person13);

      deposit1.set('submission', sub1);
      deposit1.set('repository', repo1);

      deposit2.set('submission', sub1);
      deposit2.set('repository', repo2);

      deposit3.set('submission', sub2);
      deposit3.set('repository', repo1);

      deposit4.set('submission', sub4);
      deposit4.set('repository', repo1);

      deposit5.set('repository', repo1);

      sub1.set('creator', user2);
      sub2.set('creator', user2);
      sub3.set('creator', user3);
      sub4.set('creator', user1);

      sub1.get('authors').pushObject(person1);
      sub2.get('authors').pushObject(person2);
      sub3.get('authors').pushObject(person3);
      sub4.get('authors').pushObject(person4);

      sub1.get('deposits').pushObject(deposit1);
      sub1.get('deposits').pushObject(deposit2);
      sub1.get('grants').pushObject(grant1);
      sub1.get('grants').pushObject(grant4);
      grant1.get('submissions').pushObject(sub1);

      sub1.set('journal', journalA1);

      sub2.get('deposits').pushObject(deposit3);
      grant1.get('submissions').pushObject(sub2);

      grant3.get('submissions').pushObject(sub3);
      grant4.get('submissions').pushObject(sub4);

      journalA1.set('publisher', publisherA2);
      publisherA2.get('journals').pushObject(journalA1);

      journalA3.set('publisher', publisherA2);
      publisherA2.get('journals').pushObject(journalA3);

      journalA2.set('publisher', publisherA1);
      publisherA1.get('journals').pushObject(journalA2);

      journalB1.set('publisher', publisherB1);
      publisherB1.get('journals').pushObject(journalB1);

      journalB2.set('publisher', publisherB1);
      publisherB1.get('journals').pushObject(journalB2);

      journalB3.set('publisher', publisherB1);
      publisherB1.get('journals').pushObject(journalB3);

      // ##################################################
      // Setting Dept of Edu relationships
      funder_edu.set('policy', policy_edu);
      policy_edu.get('repositories').pushObject(repo_edu);

      const edu_people = [person_edu1, person_edu2, person_edu2, person_edu3, person_edu4, person_edu5, person_edu6];
      [grant_edu1, grant_edu2, grant_edu3, grant_edu4, grant_edu5, grant_edu6, grant_edu7]
      .forEach((grant, index) => {
        grant.set('primaryFunder', funder_edu);
        grant.set('directFunder', funder_edu);
        grant.set('pi', edu_people[index]);
        // grant.get('coPi').pushObject(person_sayeed);
      });

      sub_edu1.get('grants').pushObject(grant_edu6);
      sub_edu1.get('authors').pushObject(person_sayeed);
      sub_edu1.set('journal', journal_edu1);

      // ##################################################

      return RSVP.all(objects.map(o => o.save()));
    });
  }
});
