// public/js/formValidation.js

(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault(); // stop form submission
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
