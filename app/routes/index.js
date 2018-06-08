import Route from '@ember/routing/route';

$(document).ready(() => {
  if (location.hash !== '') {
    $('html, body').animate({
      scrollTop: $(location.hash).offset().top
    }, 'slow');
  }
});
export default Route.extend({
});
