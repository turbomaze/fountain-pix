Template.schoolPage.onCreated(function() {
    var schoolId = this.data._id;
    Session.set('can-delete-'+schoolId, false);
});

Template.schoolPage.onRendered(function() {
    var schoolId = this.data._id;
    var secrets = localStorage.getItem('secrets');
    secrets = secrets ? JSON.parse(secrets) : {};
    var secret = secrets[schoolId];
    Meteor.call('isSchoolCreator', schoolId, secret,
        function(err, result) {
            if (err) return Errors.throw(err.reason);
            Session.set('can-delete-'+schoolId, result);
        }
    );
});

Template.schoolPage.helpers({
    fmtRating: function() {
        if (!this) return '0/5, (0 ratings)';

        var fmtRating = (Math.round(100*this.rating)/20);
        fmtRating = (Math.round(10*fmtRating)/10)+'';
        if (fmtRating.length === 1) fmtRating += '.0';
        fmtRating += '/5';
        var s = this.numRatings === 1 ? '' : 's';
        return fmtRating+' ('+this.numRatings+' rating'+s+')';
    },

    numFountains: function() {
        if (!this || !this.fountains) return 0;
        return Object.keys(this.fountains).length;
    },

    canDelete: function() {
        var schoolId = this._id;
        return !!Session.get('can-delete-'+schoolId);
    }
});

Template.schoolPage.events({
    'click .delete-btn': function(e, tmpl) {
        e.preventDefault();

        if (confirm('Are you sure you want to delete this school?')) {
            var schoolId = this._id;
            var secrets = localStorage.getItem('secrets');
            secrets = secrets ? JSON.parse(secrets) : {};
            var secret = secrets[schoolId];
            if (secret) {
                Meteor.call('deleteSchool', schoolId, secret,
                    function(err, result) {
                        if (err) return Errors.throw(err.reason);

                        if (result.badSchoolId) {
                            return Errors.throw(
                                'The school id you provided is invalid.'
                            );
                        } else if (result.badSecret) {
                            return Errors.throw(
                                'You don\'t have permission to delete ' +
                                'this school.'
                            );
                        } else if (result.stillHasFountains) {
                            return Errors.throw(
                                'You can only delete schools with no ' +
                                'remaining fountains.'
                            );
                        } else if (result.success) {
                            Router.go('home');
                        }
                    }
                );
            } else {
                return Errors.throw(
                    'You don\'t have permission to delete this school.'
                );
            }
        }
    }
});