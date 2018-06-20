import Route from '@ember/routing/route';

$(document).ready(() => {
  if (location.hash !== '') {
    var scrollToPosition = parseInt($(location.hash).offset().top) - 50;
    if (scrollToPosition < 0) { scrollToPosition = 0 } // make sure it is not negative
    $('html, body').animate({
      scrollTop: scrollToPosition
    }, 'slow');
  }
});
export default Route.extend({
});
