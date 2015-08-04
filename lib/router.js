
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    trackPageView: true
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
            school: {_id: schoolId}
        };
    }
});

Router.route('/school/:_id', {
    name: 'schoolPage',
    template: 'schoolPage',
    waitOn: function() {
        return [
            Meteor.subscribe('school', this.params._id),
            Meteor.subscribe('fountains'),
            Meteor.subscribe('fountainPictures')
        ];
    },
    data: function() {
        var school = Schools.findOne(this.params._id);
        if (!school) return {};
        var fmtRating = Math.round(100*school.rating)/20;
        fmtRating = (Math.round(10*fmtRating)/10)+'';
        if (fmtRating.length === 1) fmtRating += '.0';
        school.fmtRating = fmtRating + '/5';
        school.fmtNumRatings = school.numRatings+' rating';
        if (school.numRatings !== 1) {
            school.fmtNumRatings += 's';
        }
        school.numFountains = school.fountains.length;

        var fountains = !school ? [] : school.fountains.map(
            function(fountainId) {
                var fountain = Fountains.findOne(fountainId);
                if (!fountain) return {};
                return fountain;
            }
        );
        return {
            school: school,
            fountains: fountains
        };
    }
});

Router.onBeforeAction('dataNotFound');