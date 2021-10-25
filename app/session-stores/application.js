import CookieStore from 'ember-simple-auth/session-stores/cookie';
import classic from 'ember-classic-decorator';

@classic
export default class ApplicationSessionStore extends CookieStore {}
