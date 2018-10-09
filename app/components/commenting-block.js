import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  message: '',
  currentUser: Ember.inject.service('current-user'),
  editModeArray: [],
  didRender() {
    this._super();
    // console.log(this.get('comments'));
    // this.get('comments').forEach((comment) => {
    //   comment['editMode'] = true;
    // })
    // console.log(this.get('comments'));
    // this.set('editModeArray', this.get('comments'));
  },
  actions: {
    addComment() {
      if (this.message.replace(/(<([^>]+)>)/gi, '').trim().length > 0) {
        let comment = {
          dateTime: getDate(),
          message: this.message.replace(/(<([^>]+)>)/gi, ''),
          user: this.get('currentUser.user')
        };
        this.sendAction('addComment', comment);
        this.set('message', '');
      }
    },
    saveComment(orignalComment) {
      let comment = {
        dateTime: getDate(),
        message: orignalComment.message.replace(/(<([^>]+)>)/gi, ''),
        user: this.get('currentUser.user')
      };
      this.sendAction('saveComment', [
        this.comments.indexOf(orignalComment),
        comment
      ]);
    },
    deleteComment(orignalComment) {
      swal(
        'Are you sure you want to delete this comment?',
        'You will not be able to undo this.',
        {
          buttons: {
            cancel: true,
            confirm: true
          }
        }
      ).then(value => {
        if (value.dismiss) {
          return;
        }
        this.sendAction('deleteComment', this.comments.indexOf(orignalComment));
        console.log('delete comment');
      });
    },
    editComment(index) {
      console.log('EDIT DIS POO');
    }
  }
});

function getDate() {
  // Create a date object with the current time
  var now = new Date();
  // Create an array with the current month, day and time
  var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
  // Create an array with the current hour, minute and second
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  // Determine AM or PM suffix based on the hour
  var suffix = time[0] < 12 ? 'AM' : 'PM';
  // Convert hour from military time
  time[0] = time[0] < 12 ? time[0] : time[0] - 12;
  // If hour is 0, set it to 12
  time[0] = time[0] || 12;
  // If seconds and minutes are less than 10, add a zero
  for (var i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = '0' + time[i];
    }
  }
  return date.join('/') + ' ' + time.join(':') + ' ' + suffix;
}
