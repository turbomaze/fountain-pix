
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

Router.route('/school/:_id', {
    name: 'schoolPage',
    template: 'schoolPage',
    waitOn: function() {
        return [
            Meteor.subscribe('school', this.params._id)
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

        var fountainIds = Object.keys(school.fountains);
        school.numFountains = fountainIds.length;
        var fountainObjs = [];
        fountainIds.map(function(fountainId) {
            school.fountains[fountainId]._id = fountainId;
            school.fountains[fountainId].imageObj = FountainPictures.findOne(
                school.fountains[fountainId].imageRef
            );
            fountainObjs.push(school.fountains[fountainId]);
        });
        school.fountainObjs = fountainObjs;
        return school;
    }
});

Router.route('/fountain/:_id', {
    name: 'fountainPage',
    template: 'fountainPage',
    waitOn: function() {
        return [
            Meteor.subscribe('fountain', this.params._id)
        ];
    },
    data: function() {
        var fountainId = this.params._id;
        var fountain = Fountains.findOne(fountainId);
        if (!fountain) return {};
        var fountainPicIds = Object.keys(fountain.images);
        var fountainPicObjs = [];
        fountainPicIds.map(function(picId) {
            fountain.images[picId]._id = picId;
            fountain.images[picId].imageObj = FountainPictures.findOne(
                picId
            );
            fountain.images[picId].fountainId = fountainId;
            fountain.images[picId].schoolId = fountain.schoolId;
            fountain.images[picId].schoolName = fountain.schoolName;
            fountainPicObjs.push(fountain.images[picId]);
        });
        fountain.images = fountainPicObjs;

        return fountain;
    }
});

Router.onBeforeAction('dataNotFound');