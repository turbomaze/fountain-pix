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
        return Object.keys(this.fountains).length;
    }
});