export function initialize(application) {
  application.inject('controller', 'session', 'service:user-session');
}

export default {
  initialize
};
