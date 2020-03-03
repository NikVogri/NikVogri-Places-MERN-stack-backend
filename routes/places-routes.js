const express = require("express");
const router = express.Router();
const placesController = require("../controller/places-controller");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
////////////
// type: GET
// desc: get place by id
router.get("/:pid", placesController.getPlaceById);

////////////
// type: GET
// desc: get places by user id
router.get("/user/:uid", placesController.getPlacesByUserId);

////////////////////////////////////////////
////PROTECTED ROUTES
router.use(checkAuth);

////////////
// type: POST
// desc: create place
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").notEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").notEmpty()
  ],
  placesController.createPlace
);

////////////
// type: UPDATE
// desc: update place
router.patch(
  "/:pid",
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);

////////////
// type: DELETE
// desc: delete place
router.delete("/:pid", placesController.deletePlace);

module.exports = router;
