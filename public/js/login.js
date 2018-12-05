function toggleSignIn() {
    var safe = true;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var e_wrap = document.getElementById("email-wrapper");
    var p_wrap = document.getElementById("password-wrapper");
    message.className = "";
    message.innerHTML = "";
    if (email.length < 4) {
      noEmailErrMsg();
      safe = false;
    } else {
      var safe = true;
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      var e_wrap = document.getElementById("email-wrapper");
      var p_wrap = document.getElementById("password-wrapper");
      message.className = "";
      message.innerHTML = "";
      if (email.length < 4) {
        noEmailErrMsg();
        safe = false;
      }
      else {
        e_wrap.className = "form-group";
      }
      if (password.length < 4) {
        noPasswordErrMsg();
        safe = false;
      }
      else {
        p_wrap.className = "form-group";
      }
      if(!safe) return;
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
        message.className = "error-feedback";
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          //alert('Wrong password.');
          p_wrap.className = "form-group has-error has-feedback";
          e_wrap.className = "form-group has-error has-feedback";
          message.innerHTML = "Your account information or password is wrong. Please check again."
        } else {
          window.location.href="index.html";
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
        message.innerHTML = errorMessage;
        //message.innerHTML = '';
      }
      console.log(error);
      // [END_EXCLUDE]
    });
      // [END authwithemail]
  }
  /**
   * Handles the sign up button press.
   */
  function handleSignUp() {
    var safe = true;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var e_wrap = document.getElementById("email-wrapper");
    var p_wrap = document.getElementById("password-wrapper");
    message.className = "";
    message.innerHTML = "";
    if (email.length < 4) {
      noEmailErrMsg();
      safe = false;
    }
    else {
      e_wrap.className = "form-group";
    }
    if (password.length < 4) {
      noPasswordErrMsg();
      safe = false;
    }
    else {
      p_wrap.className = "form-group";
    }
    if(!safe) return;
    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).then( () => {
        window.location.href="index.html";
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      var message = document.getElementById('message');
      message.className = "error-feedback";
      // [START_EXCLUDE]
      if (errorCode == 'auth/weak-password') {
        //alert('The password is too weak.');
        document.getElementById("password-wrapper").className = "form-group has-error has-feedback";
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
    if (firebase.auth().currentUser) {
        // [START signout]
        console.log("login page log off firstly!!!!!");
        firebase.auth().signOut();
        // [END signout]
    }
    document.getElementById('signin').addEventListener('click', toggleSignIn, false);
    document.getElementById('signup').addEventListener('click', handleSignUp, false);
  }
  window.onload = function() {
    initApp();
  };
function clearErr(){
  document.getElementById("email-wrapper").className = "form-group";
  document.getElementById("password-wrapper").className = "form-group";
  message.className = "";
  message.innerHTML = "";
}
function noEmailErrMsg(){
  message.innerHTML += "Please enter an email address.<br/>";
  message.className = "error-feedback";
  document.getElementById("email-wrapper").className = "form-group has-error has-feedback";
};
function noPasswordErrMsg(){
  message.innerHTML += "Please enter a password.<br/>";
  message.className = "error-feedback";
  document.getElementById("password-wrapper").className = "form-group has-error has-feedback";
}