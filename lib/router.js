
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading'
});

Router.route('/', {
    name: 'home',
    template: 'schoolsList',
    waitOn: function() {
        return Meteor.subscribe('schools');
    },
    data: function() {
        var schools = Schools.find({}).fetch();
        schools.map(function(school) {
            var fmtRating = Math.round(100*school.rating)/20;
            fmtRating = (Math.round(10*fmtRating)/10)+'';
            if (fmtRating.length === 1) fmtRating += '.0';
            school.fmtRating = fmtRating + '/5';
            school.fmtNumRatings = school.numRatings+' rating';
            if (school.numRatings !== 1) {
                school.fmtNumRatings += 's';
            }
        });

        return {
            schools: schools
        };
    }
});

Router.route('/fountain/:_id', {
    name: 'fountainPage',
    template: 'fountainPage',
    waitOn: function() {
        return [
            Meteor.subscribe('fountain', this.params._id),
            Meteor.subscribe('fountainPictures'),
            Meteor.subscribe('schools')
        ];
    },
    data: function() {
        var fountain = Fountains.findOne(this.params._id);
        var schoolId = fountain ? fountain.schoolId : false;
        return {
            fountainObj: fountain,
            schoolId: schoolId
        };
    }
});

Router.onBeforeAction('dataNotFound');