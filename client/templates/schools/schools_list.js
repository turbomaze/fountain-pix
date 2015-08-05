Template.schoolsList.events({
    'click #bottom': function() {
        $('html, body').animate({scrollTop: $(document).height()}, 'slow');
        return false;
    }
});