const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { validateAuthor } = require("../middleware/validation");
const authorController = require("../controllers/authorController");

// List authors
router.get("/", wrapAsync(authorController.listAuthors));

// New author form
router.get("/new", authorController.renderNewForm);

// Create author
router.post("/", validateAuthor, wrapAsync(authorController.createAuthor));

// Edit author form
router.get("/:id/edit", wrapAsync(authorController.renderEditForm));

// Update author
router.put("/:id", wrapAsync(authorController.updateAuthor));

// Delete author
router.delete("/delete/:id", wrapAsync(authorController.deleteAuthor));

module.exports = router;
