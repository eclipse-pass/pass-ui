export default function() {
  this.namespace = '/api';

  // Back API by in memory database
  this.get('/grants');
  this.get('/grants/:id');
  this.post('/grants');
  this.get('/submissions');
  this.post('/submissions');
  
  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing
}
