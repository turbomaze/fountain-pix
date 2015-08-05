Template.fountainPicture.helpers({
    swipeLeft: function() {
        return Template.parentData(1).images.length > 1 ? '&larr;' : '';
    },

    swipeRight: function() {
        return Template.parentData(1).images.length > 1 ? '&rarr;' : '';
    },

    fmtDate: function() {
        var preFmt = this.createdAt.toDateString().split(' ');
        return preFmt[1]+' '+parseInt(preFmt[2])+', '+preFmt[3];
    },

    alreadyRated: function() {
        Session.get('makeReactive');
        var fountainPicId = this._id;
        var rawFountains = localStorage.getItem('ratedFountainPicIds');
        var ratedFountains = rawFountains ? JSON.parse(rawFountains) : false;
        if (!ratedFountains) {
            ratedFountains = [];
            localStorage.setItem(
                'ratedFountainPicIds', JSON.stringify(ratedFountains)
            );
        }
        return ratedFountains.indexOf(fountainPicId) !== -1;
    },

    drinkPercent: function() {
        if (!this) return '0%';

        var wouldDrink = this.numDrinkable;
        var wouldntDrink = this.numNotDrinkable;
        var denom = wouldDrink+wouldntDrink;
        if (denom === 0) return '0%';
        var pct = wouldDrink/denom;
        return (Math.floor(1000*pct)/10)+'%';
    },

    fmtRating: function() {
        if (!this) return '0/5, (0 ratings)';

        var fmtRating = (Math.round(100*this.rating)/20);
        fmtRating = (Math.round(10*fmtRating)/10)+'';
        if (fmtRating.length === 1) fmtRating += '.0';
        fmtRating += '/5';
        var s = this.numRatings === 1 ? '' : 's';
        return fmtRating+' ('+this.numRatings+' rating'+s+')';
    }
});

Template.fountainPicture.events({
    'click .drink-yes': function(e, tmpl) {
        tmpl.find('.drink-no').checked = false;
    },

    'click .drink-no': function(e, tmpl) {
        tmpl.find('.drink-yes').checked = false;
    },

    'input .cleanliness-rating': function(e, tmpl) {
        var value = e.target.value;
        value = parseInt(value)/2;
        var adjectives = [
            [5, 'Vomit inducing'],
            [16, 'Disgusting'],
            [25, 'Below average'],
            [30, 'Average'],
            [35, 'Above average'],
            [44, 'Clean'],
            [50, 'Absolutely pristine']
        ];
        for (var ai = 0; ai < adjectives.length; ai++) {
            if (value < adjectives[ai][0]) {
                tmpl.find('.clean-adj').innerHTML = adjectives[ai][1];
                break;
            }
        }
    },

    'click .rate-btn': function(e, tmpl) {
        e.preventDefault();

        var fountainPicId = this._id;
        var fountainId = this.fountainId;
        var cleanRating = tmpl.find('.cleanliness-rating').value;
        cleanRating = parseInt(cleanRating)/100; //0 to 1
        var wouldDrink = !!tmpl.find('.drink-yes').checked;
        Meteor.call('rateFountain',
            fountainId, fountainPicId, cleanRating, wouldDrink,
            function(err, result) {
                if (err) return Errors.throw(err.reason);

                if (result.badFountainId) {
                    return Errors.throw(
                        'The fountain id you provided is invalid.'
                    );
                } else if (result.badFountainPictureIdId) {
                    return Errors.throw(
                        'The picture id you provided is invalid.'
                    );
                } else if (result.badRating) {
                    return Errors.throw(
                        'Use the slider. Ratings must be between 0 and 1.'
                    );
                } else if (result.wouldDrinkNotBool) {
                    return Errors.throw(
                        'Whether or not you would drink is a boolean value.'
                    );
                } else if (result.success) {
                    //weakly prevent them from rating again
                    var rawFountains = localStorage.getItem('ratedFountainPicIds');
                    var ratedFountains = rawFountains ? JSON.parse(rawFountains) : [];
                    ratedFountains.push(fountainPicId)
                    localStorage.setItem(
                        'ratedFountainPicIds', JSON.stringify(ratedFountains)
                    );
                    Session.set('makeReactive', Math.random());
                }
            }
        );
    }
});