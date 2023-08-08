module.exports = function (environment) {
  return {
    delivery: ['header'],
    policy: {
      'default-src': ["'none'"],
      'script-src': ["'self'", "'unsafe-eval'"],
      'font-src': ["'self'", 'http://fonts.gstatic.com', 'https://fonts.googleapis.com/css2'],
      'connect-src': [
        "'self'",
        "'nonce-abcdefg'",
        "'unsafe-inline'",
        'http://code.jquery.com/jquery-1.11.1.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js',
        'http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.js',
        'http://code.cloudcms.com/alpaca/1.5.24/bootstrap/alpaca.min.js',
        'https://cdn.jsdelivr.net/npm/sweetalert2@7.26.10/dist/sweetalert2.all.min.js',
      ],
      'script-src-elem': [
        "'self'",
        "'nonce-abcdefg'",
        "'unsafe-inline'",
        'http://code.jquery.com/jquery-1.11.1.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js',
        'http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.js',
        'http://code.cloudcms.com/alpaca/1.5.24/bootstrap/alpaca.min.js',
        'https://cdn.jsdelivr.net/npm/sweetalert2@7.26.10/dist/sweetalert2.all.min.js',
      ],
      'img-src': ["'self'", 'https: data:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/css2'],
      'media-src': null,
    },
    reportOnly: false,
  };
};
