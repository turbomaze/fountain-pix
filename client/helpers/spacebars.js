Template.registerHelper('equals', function(a, b) {
    return a === b;
});

Template.registerHelper('addOne', function(a) {
    return parseFloat(a) + 1;
});