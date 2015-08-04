/* Fountains
 * @property school --- the id of the school this fountain is at
 * @property image --- reference to the image of this fountain
 * @property rating --- average rating of this fountain
 * @property ratings --- array of individual ratings, for statistics
 * @property numDrinkable --- number of people who would drink from it
 * @property numNotDrinkable --- number of people who wouldn't
 *
 */
Fountains = new Meteor.Collection('fountains');