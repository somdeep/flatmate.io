# flatmate.io
Cloud project for Team J - Roommate Finder

Somdeep Dey
Mathew Mallett
Shangshang Chen
Tian Zhang

# architecture

MEAN Stack

- MongoDB (hosted by MongoLab on AWS)
- Express.js
- Angular.js
- Node.js

Hosted on IBM Bluemix PaaS

Uses Facebook OAuth as the primary log in. We request access to various Facebook account details including likes, work, education.

Uses LinkedIn OAuth as a secondary log in to give more information for our matching algorithm.

Facebook and LinkedIn data + data the user enters in their Flatmate.io profile are used to build a score. The higher the score, the better match a user is as a potential roommate.

# running locally

You should have node.js installed locally

```npm install```

```node app.js```

# deploying to Bluemix

You need to have a Bluemix account(http://bluemix.net) and you need to have the Bluemix CLI installed and pointed at your org.

```cf push flatmateio```
