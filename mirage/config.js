export default function() {
  this.namespace = '/api';

  // Back API by in memory database
  
  this.resource('grants');
  this.resource('submissions');
  this.resource('users');
}
