"use strict";
import members from "./MonthlyDataFolder/filename.json";
import nodemailer from "nodemailer";
import config from "./meetUp.config";
import fs from "fs";

const path = require("path");
const _ = require("underscore");

// target pair amount depends on how many people have enrolled to the lottery
// use helper function countPeople.js before sending mails
const target = 46;

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: config.service,
  auth: {
    user: config.auth.user,
    pass: config.auth.pass
  }
});

const shuffleMembersArray = arr => {
  const shuffled = [...arr];
  for (let i = arr.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
  }
  return shuffled;
};

let newPairs = [];

/* Go through shuffeled members array and select suitable pairs.
Pairs can't be from the same class (starting year) and they are always new. Pairs are
added to the newPairs array.
*/
const selectPairs = arr => {
  newPairs = [];

  for (let i = 0; i < arr.length - 1; i++) {
    let j = i + 1;
    const member = arr[i];
    let next = arr[j];

    while (j < arr.length && !member.paired) {
      if (
        member.starting_year !== next.starting_year &&
        !next.paired &&
        !member.previous_lunches.includes(next.id) &&
        !next.previous_lunches.includes(member.id)
      ) {
        newPairs.push([member, next]);
        member.paired = true;
        next.paired = true;
        member.previous_lunches.push(next.id);
        next.previous_lunches.push(member.id);
      }
      j += 1;
      next = arr[j];
    }
  }
};

let tmp;
let loopCount = 0;

// iterate selectPairs function until target pair amount is reached
let shuffeledArray;
while (newPairs.length < target) {
  loopCount = loopCount + 1;
  console.log(`Pair iteration round: ${loopCount}`);
  shuffeledArray = shuffleMembersArray(members.data);
  selectPairs(shuffeledArray);
  tmp = [...shuffeledArray];
}

// reset members' paired parameter
tmp = tmp.map(x => ({
  ...x,
  paired: false
}));

// make new memberData file
const json = JSON.stringify({
  data: tmp
});

const date = new Date();
const localeDate = date.toLocaleDateString();
fs.writeFile(`./MonthlyDataFolder/${localeDate}.json`, json, "utf8", () =>
  console.log("Members written!")
);

// select current month
const d = new Date();
const month = new Array(
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
);
const currentMonth = month[d.getMonth()];

// send mails to every new pair every second after a two second timeout
console.log("Two second timeout started...");
setTimeout(() => {
  if (newPairs.length === target) {
    let time = 1000;
    let count = 1;
    newPairs.forEach(pair => {
      count += 1;
      setTimeout(() => {
        const message = `Hellou <b>${pair[0].name}</b> and <b>${pair[1].name}!</b>🔥🔥🔥<br><br>
        Time for the last lottery before autumn! 😎
        <br><br>
        You’re each other's Athene match of ${currentMonth}! By the way, summer time is perfect for meeting the previous matches you have skipped due to any reason 😘
        <br><br>
        Now you guys need to agree on what you want to do and when. You can go on a lunch date, chat over a cup of coffee or have afterwork beers – do whatever you like :)
        <br><br>
        Don’t be shy! You can contact each other via email or phone (if provided):
        <br><br>
        <b>${pair[0].name}</b> – phone: ${pair[0].phone}, starting year: ${pair[0].starting_year}
        <br>
        <b>${pair[1].name}</b> – phone: ${pair[1].phone}, starting year: ${pair[1].starting_year}
        <br><br>
        Have fun! 💚 
        <br><br>
        Best,
        <br>
        The Lottery Fairies 
        <br><br>
        PS. If you feel like taking a break from all the matching and lunching, contact me (<your contact information>).
        `;

        // setup email data with unicode symbols
        let mailOptions = {
          from: `${config.addressFrom} <your.email@gmail.com>`, // sender address
          to: `${pair[0].email}, ${pair[1].email}`, // receiver
          subject: `Surprise! ${pair[0].name} and ${pair[1].name}, you're Athene Lottery match of ${currentMonth}! 🎉`, // Subject line
          text: message, // plain text body
          html: `${message}` // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(
              `Error with: ${pair[0].name}, 
              ${pair[0].email}, 
              ${pair[0].phone},
              ${pair[0].starting_year} 
               ––
              ${pair[1].name}, 
              ${pair[1].email},
              ${pair[1].phone},
              ${pair[1].starting_year}`
            );
          }
          console.log(`Message sent to: ${pair[0].email}  –  ${pair[1].email}`);
        });
      }, time * count);
    });
  }
}, 2000);