const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { validatePublisher } = require("../middleware/validation");
const publisherController = require("../controllers/publisherController");

// List publishers
router.get("/", wrapAsync(publisherController.listPublishers));

// New publisher form
router.get("/new", publisherController.renderNewForm);

// Create publisher
router.post(
  "/",
  validatePublisher,
  wrapAsync(publisherController.createPublisher)
);

// Edit publisher form
router.get("/:name/edit", wrapAsync(publisherController.renderEditForm));

// Update publisher
router.put("/:name", wrapAsync(publisherController.updatePublisher));

// Delete publisher
router.delete("/delete/:name", wrapAsync(publisherController.deletePublisher));

module.exports = router;
