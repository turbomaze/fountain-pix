Template.fountain.helpers({
    fmtDate: function() {
        var preFmt = this.updatedAt.toDateString().split(' ');
        return preFmt[1]+' '+parseInt(preFmt[2])+', '+preFmt[3];
    },

    fmtRating: function() {
        var fmtRating = Math.round(100*this.rating)/20;
        fmtRating = (Math.round(10*fmtRating)/10)+'';
        if (fmtRating.length === 1) fmtRating += '.0';
        fmtRating += '/5';
        var fmtNumRatings = this.numRatings+' rating';
        if (this.numRatings !== 1) {
            fmtNumRatings += 's';
        }
        return fmtRating + ' ('+fmtNumRatings+')';
    },

    drinkPercent: function() {
        if (!this) return '0%';

        var wouldDrink = this.numDrinkable;
        var wouldntDrink = this.numNotDrinkable;
        var denom = wouldDrink+wouldntDrink;
        if (denom === 0) return '0%';
        var pct = wouldDrink/denom;
        return (Math.floor(1000*pct)/10)+'%';
    }
});