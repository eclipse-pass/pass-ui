import DS from 'ember-data';

/**
 * Currently, this is a placeholder model until this aspect can be better modeled.
 */
export default DS.Model.extend({
  /** Title of the policy e.g. NIH Public Access Policy (REQUIRED) */
  title: DS.attr('string'),
  /** Human readable description of policy */
  description: DS.attr('string'),
  /** List of repositories that can satisfy the policy (REQUIRED) */
  repositories: DS.hasMany('repository'),
  /** Should this policy appear for all new submissions? */
  isDefault: DS.attr('boolean')
});
