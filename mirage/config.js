export default function() {
  this.namespace = '/api';

  // Back API by in memory database

  this.resource('grants');
  this.resource('submissions');
  this.resource('users');

  // Enable query for users
  this.get('/users', (schema, request) => {
    return schema.users.where(request.queryParams);
  });
}
