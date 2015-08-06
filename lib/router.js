
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

        var fountainIds = Object.keys(school.fountains);
        var fountainObjs = [];
        fountainIds.map(function(fountainId, idx) {
            school.fountains[fountainId]._id = fountainId;
            school.fountains[fountainId]._idx = idx;
            school.fountains[fountainId].imageObj = FountainPictures.findOne(
                school.fountains[fountainId].imageRef
            );
            fountainObjs.push(school.fountains[fountainId]);
        });
        school.fountainObjs = fountainObjs;
        return school;
    }
});

Router.route('/fountain/:_id/:_idx', {
    name: 'fountainPage',
    template: 'fountainPage',
    waitOn: function() {
        return [
            Meteor.subscribe('fountain', this.params._id)
        ];
    },
    onBeforeAction: function() {
        var parsed = parseInt(this.params._idx);
        if (isNaN(parsed) || parsed < 0) {
            Router.go('fountainPage', {
                _id: this.params._id,
                _idx: 0
            });
        }
        this.next();
    },
    data: function() {
        var fountainId = this.params._id;
        var fountainPicIdx = parseInt(this.params._idx);
        var fountain = Fountains.findOne(fountainId);
        if (!fountain) return {};
        var fountainPicIds = Object.keys(fountain.images);
        if (fountainPicIdx >= fountainPicIds.length &&
            fountainPicIds.length !== 0) {
            Router.go('fountainPage', {
                _id: this.params._id,
                _idx: fountainPicIds.length-1,
            });
        }
        var fountainPicObjs = [];
        fountainPicIds.map(function(picId, idx) {
            fountain.images[picId]._id = picId;
            fountain.images[picId]._idx = idx;
            fountain.images[picId].imageObj = FountainPictures.findOne(
                picId
            );
            fountain.images[picId].fountainId = fountainId;
            fountain.images[picId].schoolId = fountain.schoolId;
            fountain.images[picId].schoolName = fountain.schoolName;
            if (idx === fountainPicIdx) {
                fountain.images[picId].showClass = 'show';
            } else {
                fountain.images[picId].showClass = 'hide';
            }
            fountainPicObjs.push(fountain.images[picId]);
        });
        fountain.images = fountainPicObjs;
        fountain.maxIdx = fountainPicIds.length;

        return fountain;
    }
});

Router.route('/fountain/:_id', function() {
    Router.go('fountainPage', {
        _id: this.params._id,
        _idx: 0
    });
});

Router.onBeforeAction('dataNotFound');