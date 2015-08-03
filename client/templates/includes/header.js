Template.header.helpers({
    currentUser: function() {
        return !!Meteor.userId();
    }
});

Template.header.events({
    'click .logout': function() {
        Meteor.logout();
    }
});