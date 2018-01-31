/* countPeople.js is a support script for validating and logging the current 
match pairing data */

const people = require("./AtheneWeeklyData/2017-12-3.json");
const und = require("underscore");

const grouped = und.groupBy(people.data, "starting_year");

console.log(
  `Amount of people in Athene lottery: ${people.data.length}
Target pair amount: ${people.data.length / 2}`
);

const keys = Object.keys(grouped);
for (var i = 0; i < keys.length; i++) {
  console.log(`${keys[i]} – ${grouped[keys[i]].length}`);
}

const allNames = und.map(people.data, function(person) {
  return person.name;
});
const allIDs = und.map(people.data, function(person) {
  return person.id;
});

const uniqueIDs = und.uniq(allIDs);
const uniqueNames = und.uniq(allNames);
console.log(`Names are unique: ${allNames.length === uniqueNames.length}`);
console.log(`IDs are unique: ${allIDs.length === uniqueIDs.length}`);
