Template.fountainPage.helpers({
    imageObj: function() {
        return FountainPictures.findOne(this.fountainObj.imageRef);
    }
});