/* countPeople.js is a support script for validating and logging the current 
match pairing data */

const people = require("./MonthlyDataFolder/latestFilename.json");
const onABreak = require("./on_a_break.json");
const _ = require("underscore");

const grouped = _.groupBy(people.data, "starting_year");

console.log(
  `Amount of people in Athene lottery: ${people.data.length}
Target pair amount: ${people.data.length / 2}`
);

const keys = Object.keys(grouped);
for (var i = 0; i < keys.length; i++) {
  console.log(`${keys[i]} – ${grouped[keys[i]].length}`);
}

const allNames = _.map(people.data, function (person) {
  return person.name;
});
const allIDs = _.map(people.data, function (person) {
  return person.id;
});

const inactiveIDs = _.map(onABreak.on_a_break, function (person) {
  return person.id
})

const uniqueIDs = _.uniq(allIDs);
const uniqueNames = _.uniq(allNames);
const maxActiveId = _.max(uniqueIDs);
const maxInactiveId = _.max(inactiveIDs);
console.log(`Names are unique: ${allNames.length === uniqueNames.length}`);
console.log(`IDs are unique: ${allIDs.length === uniqueIDs.length}`);
console.log(`Highest active ID: ${maxActiveId}`);
console.log(`Highest inactive ID: ${maxInactiveId}`);