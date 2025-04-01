let auth = firebase.auth();
let database = firebase.database();

let canvas, ctx;
let cat, foods, score, lives, gameOver;
let foodImages = [];
let catImage;
let badImages = [];
let foodFallSpeed = 6;
let isRegistering = false;
const speedIncreaseInterval = 30000;
const speedIncrement = 0.5;

function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "flex";
    document.getElementById("game-container").style.background = "url('background.jpeg') no-repeat center center/cover";
    document.getElementById("game-over-screen").style.display = "none";

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    catImage = new Image();
    catImage.src = "cat.png";

    foodImages = [new Image(), new Image(), new Image()];
    foodImages[0].src = "food1.png";
    foodImages[1].src = "food2.png";
    foodImages[2].src = "food3.png";

    badImages = [new Image(), new Image(), new Image()];
    badImages[0].src = "trash1.png";
    badImages[1].src = "trash2.png";
    badImages[2].src = "trash3.png";

    cat = {
        x: canvas.width / 2 - 50,
        y: canvas.height - 150,
        width: 150,
        height: 150,
        speed: 15,
        moveLeft: false,
        moveRight: false
    };

    foods = [];
    score = 0;
    lives = 3;
    gameOver = false;

    let imagesLoaded = 0;
    let totalImages = foodImages.length + badImages.length + 1;

    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            gameLoop();
        }
    }

    catImage.onload = imageLoaded;
    foodImages.forEach(img => img.onload = imageLoaded);
    badImages.forEach(img => img.onload = imageLoaded);
}

function quitGame() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("game-container").style.background = "url('menu-background.jpeg') no-repeat center center/cover";

    foods = [];
    score = 0;
    lives = 3;
    gameOver = false;
}document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") cat.moveLeft = true;
  if (event.key === "ArrowRight") cat.moveRight = true;
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") cat.moveLeft = false;
  if (event.key === "ArrowRight") cat.moveRight = false;
});

function createFood() {
  const x = Math.random() * (canvas.width - 40) + 20;
  const isBad = Math.random() < 0.5;
  const imgArray = isBad ? badImages : foodImages;
  const imageIndex = Math.floor(Math.random() * imgArray.length);
  foods.push({ x: x, y: -40, img: imgArray[imageIndex], isBad: isBad });
}

function moveCat() {
  if (cat.moveLeft && cat.x > 0) cat.x -= cat.speed;
  if (cat.moveRight && cat.x + cat.width < canvas.width) cat.x += cat.speed;
}

function moveFoods() {
  for (let i = foods.length - 1; i >= 0; i--) {
      foods[i].y += 3;

      if (
          foods[i].y + 40 > cat.y &&
          foods[i].x > cat.x &&
          foods[i].x < cat.x + cat.width
      ) {
          if (foods[i].isBad) {
              lives--;
              if (lives <= 0) {
                  gameOver = true;
                  startGameOver();
              }
          } else {
              score++;
          }
          foods.splice(i, 1);
      } else if (foods[i].y > canvas.height) {
          foods.splice(i, 1);
      }
  }
}

function drawCat() {
  ctx.drawImage(catImage, cat.x, cat.y, cat.width, cat.height);
}

function drawFoods() {
  foods.forEach(food => {
      ctx.drawImage(food.img, food.x, food.y, 80, 80);
  });
}

function drawScoreAndLives() {
  ctx.fillStyle = "#072530";
  ctx.font = "20px 'Arial Rounded MT Bold', Arial, sans-serif";
  ctx.fillText("Score: " + score, 10, 30);

  const heartImage = new Image();
  heartImage.src = "heart.png";
  for (let i = 0; i < lives; i++) {
      ctx.drawImage(heartImage, canvas.width - 30 - (i * 30), 10, 25, 25);
  }
}
function startGameOver() {
  document.getElementById("final-score").textContent = "Your Score: " + score;
  document.getElementById("game-over-screen").style.display = "flex";
  saveGameRecord(score);
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameOver) {
      moveCat();
      moveFoods();
      drawCat();
      drawFoods();
      drawScoreAndLives();
  } else {
      startGameOver();
  }
  if (Math.random() < 0.02) createFood();
  if (!gameOver) requestAnimationFrame(gameLoop);
}
function extraFunction() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.style.display = 'flex';
  }

  isRegistering = false;
  switchAuthMode();
}
function extraFunction() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.style.display = 'flex';
  }

  isRegistering = false;
  switchAuthMode();
}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('login-button').addEventListener('click', loginOrRegister);
});

function switchAuthMode() {
  const title = document.getElementById('modal-title');
  const nameField = document.getElementById('register-name');
  const button = document.getElementById('login-button');
  const toggleText = document.getElementById('toggle-text');

  if (isRegistering) {
    title.textContent = "Regisztráció";
    nameField.style.display = "block";
    button.textContent = "Regisztrálok";
    toggleText.innerHTML = `Van már fiókod? <a href="#" id="toggle-register">Bejelentkezés</a>`;
  } else {
    title.textContent = "Bejelentkezés";
    nameField.style.display = "none";
    button.textContent = "Bejelentkezés";
    toggleText.innerHTML = `Még nincs fiókod? <a href="#" id="toggle-register">Regisztráció</a>`;
  }

  // újragomb újrafigyelés
  setTimeout(() => {
    const toggleLink = document.getElementById('toggle-register');
    if (toggleLink) {
      toggleLink.addEventListener('click', function (e) {
        e.preventDefault();
        isRegistering = !isRegistering;
        switchAuthMode();
      });
    }
  }, 0);
}

window.addEventListener('DOMContentLoaded', function () {
  const loginModal = document.getElementById('login-modal');
  const logoutButton = document.getElementById('logout-button');
  const loginButton = document.getElementById('login-button');
  const menuButton = document.getElementById('menu-button'); // Menü gomb
  const menuModule = document.getElementById('menu-module'); // Menü modul
  const closeLoginButton = document.getElementById('close-login');

  // 🔁 Állapotfigyelés: be van-e jelentkezve valaki
  firebase.auth().onAuthStateChanged(function(user) {
      const adminLink = document.getElementById('admin-link');

      if (user) {
          if (logoutButton) logoutButton.style.display = 'inline-block';
          if (menuButton) menuButton.style.display = 'inline-block';
          if (loginButton) loginButton.style.display = 'none';

          const userRef = firebase.database().ref('users/' + user.uid);
          userRef.once('value').then(snapshot => {
              const userData = snapshot.val();
              if (userData) {
                  loadUserData(userData, user.uid);

                  if (adminLink) {
                      if (userData.role === 'admin') {
                          adminLink.style.display = 'block';
                      } else {
                          adminLink.style.display = 'none';
                      }
                  }
              }
          }).catch(error => {
              console.error("⚠️ Hiba a felhasználói adatok betöltésekor:", error);
          });
      } else {
          if (logoutButton) logoutButton.style.display = 'none';
          if (menuButton) menuButton.style.display = 'none';
          if (loginButton) loginButton.style.display = 'inline-block';
      }
  });

  if (logoutButton) {
      logoutButton.addEventListener('click', function () {
          firebase.auth().signOut()
              .then(() => {
                  alert("Sikeres kijelentkezés!");
                  if (loginModal) loginModal.style.display = 'none';
                  document.getElementById('start-screen').style.display = 'flex';
              })
              .catch((error) => {
                  alert("Hiba történt kijelentkezéskor: " + error.message);
              });
      });
  }

  if (menuButton) {
      menuButton.addEventListener('click', openMenu);
  }

  if (closeLoginButton) {
      closeLoginButton.addEventListener('click', function () {
          if (loginModal) loginModal.style.display = 'none';
          document.getElementById('start-screen').style.display = 'flex';
      });
  }

  function openMenu() {
      if (menuModule) {
          menuModule.style.display = (menuModule.style.display === 'none' || menuModule.style.display === '') ? 'block' : 'none';
      } else {
          console.error("⚠️ A 'menu-module' elem nem található!");
      }
  }

  function loadUserData(userData, userId) {
      if (!menuModule) return;

      let userInfoHTML = `
          <ul>
              <li><strong>Név:</strong> ${userData.name || "N/A"}</li>
              <li><strong>Email:</strong> ${userData.email || "N/A"}</li>
              <li><strong>Szerepkör:</strong> ${userData.role || "N/A"}</li>
          </ul>
          <h3>Rekordjaid:</h3>
          <ul id="record-list">
              <li>Betöltés...</li>
          </ul>
      `;

      if (userData.role === "admin") {
          userInfoHTML += `<h3><a id="admin-link" href="admin.html" style="color: red; font-weight: bold; display: block;">🔹 Admin oldal</a></h3>`;
      }

      menuModule.innerHTML = userInfoHTML;

      const recordsRef = firebase.database().ref('records/' + userId);
      recordsRef.once('value').then(snapshot => {
          const records = snapshot.val();
          let recordListHTML = "";

          if (records) {
              recordListHTML = Object.values(records).map(record => 
                  `<li><strong>Pontszám:</strong> ${record.score ?? "N/A"}, 
                  <small>${record.timestamp ? new Date(record.timestamp).toLocaleString() : "N/A"}</small></li>`
              ).join('');
          } else {
              recordListHTML = "<li>Nincsenek rekordok.</li>";
          }

          const recordList = document.getElementById('record-list');
          if (recordList) {
              recordList.innerHTML = recordListHTML;
          }
      }).catch(error => {
          console.error("⚠️ Hiba a rekordok betöltésekor:", error);
          const recordList = document.getElementById('record-list');
          if (recordList) {
              recordList.innerHTML = "<li>Hiba történt a betöltéskor.</li>";
          }
      });
  }
});


// Firebase Login
function loginOrRegister() {
  const nameField = document.getElementById('register-name'); // Ez csak regisztrációnál kell
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-password').value;

  // 🔹 Ellenőrizzük, hogy regisztráció vagy bejelentkezés történik
  const isRegistering = nameField && nameField.value.trim() !== '';

  if (isRegistering) {
    // ✅ Regisztráció
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return firebase.database().ref('users/' + user.uid).set({
                name: nameField.value,
                email: email,
                role: "user"  // 🔹 Alapértelmezett szerepkör "user"
            });
        })
        .then(() => {
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
            showAuthMessage("Sikeres regisztráció!", "green");
        })
        .catch((error) => {
            showAuthMessage("Hiba: " + error.message, "red");
        });
  } else {
      // ✅ Bejelentkezés
      firebase.auth().signInWithEmailAndPassword(email, password)
          .then(() => {
              document.getElementById('login-modal').style.display = 'none';
              document.getElementById('start-screen').style.display = 'flex';
              showAuthMessage("✅ Sikeres bejelentkezés!", "green");
          })
          .catch((error) => {
              showAuthMessage("❌ Sikertelen bejelentkezés: " + error.message, "red");
          });
  }
}

  
function extraFunction() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.style.display = 'flex';
    }
    isRegistering = false;
    switchAuthMode();
  }
  
  window.addEventListener('DOMContentLoaded', function() {
    // Login modal bezárása, csak ha az elem létezik
    const closeLogin = document.getElementById('close-login');
    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        });
    } else {
        console.warn("❌ close-login elem nem található!");
    }

    // Regisztrációs modal bezárása, csak ha az elem létezik
    const closeRegister = document.getElementById('close-register');
    if (closeRegister) {
        closeRegister.addEventListener('click', function() {
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        });
    } else {
        console.warn("❌ close-register elem nem található!");
    }

    // Hozzászólások betöltése
    loadComments();
});

//COMMENTS
function reportComment(commentId, commentData) {
  const reportReason = prompt("Miért szeretnéd jelenteni ezt a kommentet?");

  if (!reportReason) {
    alert("A jelentéshez meg kell adnod egy okot.");
    return;
  }

  const report = {
    reportReason: reportReason,
    timestamp: Date.now()
  };

  firebase.database().ref(`comments/${commentId}/reports`).push(report)
    .then(() => {
      alert("Köszönjük, a jelentésedet rögzítettük!");
    })
    .catch(error => {
      console.error("Hiba a jelentés mentésekor:", error);
      alert("Hiba történt. Kérlek, próbáld újra.");
    });
}
function postComment() {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert('Kérlek, jelentkezz be a hozzászóláshoz!');
    return;
  }

  const commentText = document.getElementById('comment-input').value.trim();
  const commentName = document.getElementById('comment-name').value.trim() || 'Névtelen';

  if (commentText === '') {
    alert('Kérlek, írj be egy hozzászólást!');
    return;
  }

  const newComment = {
    text: commentText,
    name: commentName,
    timestamp: Date.now(),
    uid: user.uid // opcionálisan mentjük a felhasználó azonosítóját
  };

  firebase.database().ref('comments').push(newComment)
    .then(() => {
      document.getElementById('comment-input').value = '';
      loadComments();
    })
    .catch(error => {
      console.error('Hiba a komment beküldésekor:', error);
    });
}

function loadComments() {
  const commentsRef = firebase.database().ref('comments').orderByChild('timestamp');
  commentsRef.off();
  commentsRef.on('value', (snapshot) => {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    commentsList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      const commentId = childSnapshot.key;
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');
      commentElement.innerHTML = `
        <p><strong>${comment.name}</strong> (${new Date(comment.timestamp).toLocaleString()}):</p>
        <p>${comment.text}</p>
        <button onclick="reportComment('${commentId}')">Jelentés</button>
        <hr>
      `;
      commentsList.prepend(commentElement);
    });
  });
}

function showAuthMessage(message, color = "red") {
  const msgElem = document.getElementById('auth-message');
  if (msgElem) {
    msgElem.textContent = message;
    msgElem.style.color = color;
    msgElem.style.display = 'block';

    setTimeout(() => {
      msgElem.textContent = "";
    }, 5000);
  }
  //RECORD MENTÉS
  function saveRecord(score) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userRef = firebase.database().ref('users/' + user.uid);
        userRef.once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                const recordData = {
                    score: score,
                    timestamp: Date.now(),
                    email: userData.email || "N/A",
                    name: userData.name || "N/A"
                };

                firebase.database().ref('records/' + user.uid).push(recordData)
                    .then(() => {
                        console.log("✅ Rekord sikeresen mentve!");
                    })
                    .catch(error => {
                        console.error("⚠️ Hiba történt a rekord mentésekor:", error);
                    });
            }
        }).catch(error => {
            console.error("⚠️ Hiba a felhasználói adatok lekérésekor:", error);
        });
    } else {
        console.warn("⚠️ Nincs bejelentkezett felhasználó, nem lehet menteni a rekordot.");
    }
}

  
  function getGameRecord() {
    const user = firebase.auth().currentUser;
  
    if (user) {
      const userId = user.uid;
      const recordsRef = firebase.database().ref('records/' + userId);
      
      recordsRef.once('value').then(function(snapshot) {
        const recordData = snapshot.val();
        if (recordData) {
          console.log('A felhasználó rekordja: ', recordData);
        } else {
          console.log('Nincs rekord a felhasználónak!');
        }
      }).catch(function(error) {
        console.error('Hiba a rekord lekérésekor: ', error);
      });
    }
  }
  function openMenu() {
    const menuModule = document.getElementById('menu-module');
    if (menuModule) {
        console.log("openMenu() meghívva!"); // ✅ Ellenőrzés
        if (menuModule.style.display === 'none' || menuModule.style.display === '') {
            menuModule.style.display = 'block';
            console.log("Menü megnyitva!"); // ✅ Ellenőrzés
        } else {
            menuModule.style.display = 'none';
            console.log("Menü bezárva!"); // ✅ Ellenőrzés
        }
    } else {
        console.error("A 'menu-module' elem nem található!");
    }
}


}
