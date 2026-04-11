/**
 * PetHub admin login — demo credentials only (not secure for production).
 */
(function () {
  "use strict";

  var USER = "admin";
  var PASS = "1234";
  var LS_KEY = "isAdminLoggedIn";

  var form = document.getElementById("form-admin-login");
  var err = document.getElementById("login-error");

  if (localStorage.getItem(LS_KEY) === "true") {
    window.location.replace("admin-dashboard.html");
    return;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = (document.getElementById("admin-username") || {}).value || "";
      var p = (document.getElementById("admin-password") || {}).value || "";
      if (u.trim() === USER && p === PASS) {
        localStorage.setItem(LS_KEY, "true");
        window.location.href = "admin-dashboard.html";
        return;
      }
      if (err) {
        err.hidden = false;
        err.textContent = "Invalid username or password.";
      }
    });
  }
})();
