import DS from 'ember-data';

export default DS.Model.extend({
  /**
   * (Requried)
   */
  username: DS.attr('string'),
  /**
   * User role (Required)
   * Possible values:
   *  - pi (Principal Investigator)
   *  - admin
   */
  role: DS.attr('string'), // 'admin' or 'pi'
  /**
   * Person obj associated with this user
   */
  person: DS.belongsTo('person')
});
