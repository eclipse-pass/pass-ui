import CheckSessionRoute from './check-session-route';

$(document).ready(() => {
  if (location.hash !== '') {
    $('html, body').animate({
      scrollTop: $(location.hash).offset().top
    }, 'slow');
  }
});
export default CheckSessionRoute.extend({
});
