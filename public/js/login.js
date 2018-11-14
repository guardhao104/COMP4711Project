function toggleSignIn() {
    if (firebase.auth().currentUser) {
      // [START signout]
      firebase.auth().signOut();
      // [END signout]
    } else {
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      if (email.length < 4) {
        alert('Please enter an email address.');
        return;
      }
      if (password.length < 4) {
        alert('Please enter a password.');
        return;
      }
      // Sign in with email and pass.
      // [START authwithemail]
      firebase.auth().signInWithEmailAndPassword(email, password).then( user =>{
          const admin_uid = "5KvEU8TQQLV1BPC1KxCQ9eOtpyl1";
          if (user.user.uid == admin_uid) {
            window.location.href="admin.html";
          } else {
            window.location.href="user.html";
          }
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        var message = document.getElementById('message');
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          //alert('Wrong password.');
          message.innerHTML = "Your account information or password is wrong. Please check again."
        } else {
          alert(errorMessage);
          message.innerHTML = '';
        }
        console.log(error);
        document.getElementById('signin').disabled = false;
        // [END_EXCLUDE]
      });
      // [END authwithemail]
    }
    document.getElementById('signin').disabled = true;
  }
  /**
   * Handles the sign up button press.
   */
  function handleSignUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).then( () => {
        window.location.href="user.html";
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      var message = document.getElementById('message');
      // [START_EXCLUDE]
      if (errorCode == 'auth/weak-password') {
        //alert('The password is too weak.');
        message.innerHTML = 'The password is too weak.';
      } else {
        alert(errorMessage);
        message.innerHTML = '';
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    // [END createwithemail]
  }
  /**
   * initApp handles setting up UI event listeners and registering Firebase auth listeners:
   *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
   *    out, and that is where we update the UI.
   */
  function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        // [START_EXCLUDE]
        document.getElementById('signin').textContent = 'Sign out';
        // [END_EXCLUDE]
      } else {
        // User is signed out.
        // [START_EXCLUDE]
        document.getElementById('signin').textContent = 'Sign in';
        // [END_EXCLUDE]
      }
      // [START_EXCLUDE silent]
      document.getElementById('signin').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authstatelistener]
    document.getElementById('signin').addEventListener('click', toggleSignIn, false);
    document.getElementById('signup').addEventListener('click', handleSignUp, false);
  }
  window.onload = function() {
    initApp();
  };