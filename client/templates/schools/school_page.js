Template.schoolPage.helpers({
    fountainPics: function() {
        return this.fountains.map(function(fountain) {
            if (!fountain.imageRef) return {};
            var fountainPic = FountainPictures.findOne(
                fountain.imageRef
            );

            if (!fountain.ratings) {
                return {};
            } else if (fountain.ratings.length !== 1) {
                fountain.ratingsWord = 'times';
            } else {
                fountain.ratingsWord = 'time';
            }

            fountainPic.fountainData = fountain;
            return fountainPic;
        });
    }
});