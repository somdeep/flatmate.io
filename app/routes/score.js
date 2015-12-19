
var getScore = function(data, myData){

  //=================Begin of self-defined matching algorithm==================
  // score of matching
  var score = 0;
  // info
  var info = "flatmate.io user";

  // 1. price: if two people have overlap in price range
  if(myData[0].toJSON().priceLow != null
    && myData[0].toJSON().priceHigh != null
    && data.toJSON().priceLow != null
    && data.toJSON().priceHigh != null)
  {
    if(myData[0].toJSON().priceLow < data.toJSON().priceHigh &&
       myData[0].toJSON().priceHigh > data.toJSON().priceLow)
    {
      score += 50;
    }
  }

  // 2. currentCity
  if(myData[0].toJSON().currentCity != null
    && data.toJSON().currentCity != null)
  {
    var myWords = [];
    myWords = myData[0].toJSON().currentCity
              .toLowerCase()
              .split(",");
    var friendWords = [];
    friendWords = data.toJSON().currentCity
              .toLowerCase()
              .split(",");
    // if they live in the same current city
    if (myWords[0] == friendWords[0]) {
      score += 10;
    }
  }

  // 3. hometown
  if(myData[0].toJSON().hometown != null
    && data.toJSON().hometown != null)
  {
    myWords = [];
    myWords = myData[0].toJSON().hometown
              .toLowerCase()
              .split(",");
    friendWords = [];
    friendWords = data.toJSON().hometown
              .toLowerCase()
              .split(",");
    // if they live in the same current city
    if (myWords[0] == friendWords[0]) {
      score += 10;
    }
  }

  // 4. location
  if(myData[0].toJSON().location != null
    && data.toJSON().location != null)
  {
    myWords = [];
    myWords = myData[0].toJSON().location
              .toLowerCase()
              .split(",");
    friendWords = [];
    friendWords = data.toJSON().location
              .toLowerCase()
              .split(",");
    // if they write the same location in profile
    if (myWords[0] == friendWords[0]) {
      score += 10;
    }
  }

  // 5. birthday
  if(myData[0].toJSON().birthday != null
    && data.toJSON().birthday != null)
  {
    var myBirthDate = [];
    myBirthDate = myData[0].toJSON().birthday
              .toLowerCase()
              .split("/");
    var birthDate = [];
    birthDate = data.toJSON().birthday
              .toLowerCase()
              .split("/");
    // if their  age difference is less than 5 years old
    if (Math.abs(myBirthDate[2] - birthDate[2]) <= 5) {
      score += 10;
    }
  }

  // 6. education
    if(myData[0].toJSON().education != null
      && data.toJSON().education != null)
    {
      // if they are ever in the same school
      for (i = 0; i < myData[0].toJSON().education.length; i++) {
        for (j = 0; j < data.toJSON().education.length; j++) {
          if (myData[0].toJSON().education[i].school.id == data.toJSON().education[j].school.id) {
            score += 10;
          }
        }
      }
    }

  // 7. work
  if(myData[0].toJSON().work != null
    && data.toJSON().work != null)
  {
    // if they are ever in the same company
    for (i = 0; i < myData[0].toJSON().work.length; i++) {
      for (j = 0; j < data.toJSON().work.length; j++) {
        if (myData[0].toJSON().work[i].employer.id == data.toJSON().work[j].employer.id) {
          score += 10;
        }
      }
    }

  }

  // 8. likes
  if(myData[0].toJSON().likes != null
    && data.toJSON().likes != null)
  {
    // if they have the same like
    for (i = 0; i < myData[0].toJSON().likes.data.length; i++) {
      for (j = 0; j < data.toJSON().likes.data.length; j++) {
        if (myData[0].toJSON().likes.data[i].id == data.toJSON().likes.data[j].id) {
          score += 10;
        }
      }
    }

  }

  // 9. friends
  if(myData[0].toJSON().friends != null
    && data.toJSON().friends != null)
  {
    // if they are friends
    for (i = 0; i < myData[0].toJSON().friends.data.length; i++) {
      if (myData[0].toJSON().friends.data[i].id == data.toJSON().userid) {
        score += 100;
        info = "You are Facebook friends!"
      }
    }
  }

// end of Facebook API
// start of Linkedin API

  // 10. industry
  if(myData[0].toJSON().linkedin != null
    && data.toJSON().linkedin != null)
  {
    // if they are in the same industry
    if (myData[0].toJSON().linkedin._json.industry != null &&
        data.toJSON().linkedin._json.industry != null) {
      if (myData[0].toJSON().linkedin._json.industry == data.toJSON().linkedin._json.industry) {
        score += 10;
      }
    }
  }

  // 11. currentSchool
  if(myData[0].toJSON().linkedin != null
    && data.toJSON().linkedin != null)
  {
    // if they are in the same school now
    if (myData[0].toJSON().linkedin._json.location != null &&
        data.toJSON().linkedin._json.location != null) {
      if (myData[0].toJSON().linkedin._json.location.name == data.toJSON().linkedin._json.location.name) {
        score += 10;
      }
    }
  }

  // 12. positions
  if(myData[0].toJSON().linkedin != null
    && data.toJSON().linkedin != null)
  {
    // if they have worked in the same company or as same profession
    if (myData[0].toJSON().linkedin._json.positions.values != null &&
        data.toJSON().linkedin._json.positions.values != null) {
      for (i = 0; i < myData[0].toJSON().linkedin._json.positions.values.length; i++) {
        for (j = 0; j < data.toJSON().linkedin._json.positions.values.length; j++) {
          if (myData[0].toJSON().linkedin._json.positions.values[i].company.id
              == data.toJSON().linkedin._json.positions.values[j].company.id) {
            score += 10;
          }
          if (myData[0].toJSON().linkedin._json.positions.values[i].title
              == data.toJSON().linkedin._json.positions.values[j].title) {
            score += 10;
          }
        }
      }
    }

  }


  // console.log('==========================');
  // console.log(score);
  // console.log('==========================');
  var callBackString = [];
  callBackString.value1 = score;
  callBackString.value2 = info;
  return callBackString;
  // =================End of self-defined matching algorithm==================


}

module.exports = getScore;
