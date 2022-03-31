var pottyID = localStorage.getItem("pottyID");
var currentUser;
var currentPotty;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = db.collection("Users").doc(user.uid); //global
    currentPotty = db.collection("Potties").doc(pottyID); //global
    loadPotty(pottyID, "Potties");
  } else {
    window.location.href = "login.html";
  }
});

async function loadPotty(pottyID, collection) {
  let cardTemplate = document.getElementById("pottyTemplate");

  let pottyRef = db.collection(collection).doc(pottyID);
  const doc = await pottyRef.get();
  var title = doc.data().title; //get potty title
  var ratings = doc.data().ratings; //get potty ratings (integer)
  var starRatings = "";
  var features = "";
  let newcard = cardTemplate.content.cloneNode(true);

  //update card
  //title
  newcard.querySelector("#pottyTitle").innerHTML = title;

  //update image
  if (doc.data().potty_pic != null) {
    newcard.querySelector("#pottyImage").src = doc.data().potty_pic;
    displayPhotos(doc.data().potty_pic);
  }

  //public or private
  newcard.getElementById("privacy").innerHTML = doc.data().isPublic;

  //check for ratings
  for (n = 0; n < ratings; n++) {
    starRatings =
      starRatings + "<i class='text-warning material-icons'>star</i>";
  }
  newcard.querySelector(".rating").innerHTML = starRatings;

  //check for features
  if (doc.data().mobility_accessible == true) {
    features += "<i class='text-accent material-icons'>accessible</i>";
  }
  if (doc.data().diaper_station == true) {
    features +=
      "<i class='text-accent material-icons'>baby_changing_station</i>";
  }
  if (doc.data().gender_neutral == true) {
    features += "<i class='text-accent material-icons'>transgender</i>";
  }
  newcard.querySelector(".features").innerHTML = features;

  //change heart icon according to saved state
  if (doc.data().whoBookmarked.includes(currentUser.id)) {
    newcard.querySelector(".favorite").innerHTML = "bookmark";
  } else {
    newcard.querySelector(".favorite").innerHTML = "bookmark_border";
  }

  document.getElementById("detail").innerText = doc.data().detail;

  displayDetails(doc.data().detail, doc.data().userID);

  document.getElementById("Potty-go-here").appendChild(newcard);
}

async function displayDetails(detail, authorID) {
  document.getElementById("detail").innerText = detail;
  let author = db.collection("Users").doc(authorID);
  let doc = await author.get();
  document.getElementById("author").innerText = doc.data().name;
}

function displayPhotos(picURL) {
  document.getElementById("pottyPhotos").src = picURL;
}

function addBookmark() {
  currentPotty.set(
    {
      whoBookmarked: firebase.firestore.FieldValue.arrayUnion(currentUser.id),
    },
    {
      merge: true,
    }
  );

  currentUser
    .set(
      {
        bookmarks: firebase.firestore.FieldValue.arrayUnion(pottyID),
      },
      {
        merge: true,
      }
    )
    .then(function () {
      console.log("bookmark has been saved for: " + currentUser);
      db.collection("Potties").doc(pottyID).update({
        saved: true,
      });
    });
}