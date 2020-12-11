const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../../lib/utilites")
const { check, validationResult } = require("express-validator")

const router = express.Router()
const reviewsFilePath = path.join(__dirname, "reviews.json")

// GET /products/id/reviews => get all the reviews for a given product
router.get("/:productID/", async (req, res, next) => {
    try {
      const reviews = await readDB(reviewsFilePath)
      const filteredReviews = reviews.filter(
        (review) => review.productID === req.params.productID
      );
  
      res.send(filteredReviews);
    } catch (err) {
      next(err);
    }
  });

// POST /products/id/reviews => add a new review for the given product
router.post("/:productID/", 

[
    check("comment")
      .exists()
      .withMessage("Add a comment for the review please!"),
    check("rate")
      .exists()
      .withMessage("Provide a rate from 1-5 please!")
      .isInt({ min: 1, max: 5})
  ],
async (req, res, next) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const reviewsDB = await readDB(reviewsFilePath)
        console.log("reviewsDB:::", reviewsDB);
        console.log("reviewsFilePath::::",reviewsFilePath)

        const newReview = {
          ...req.body,
          _id: uniqid(),
          productID: req.params.productID,
          addedAt: new Date(),
        }
        console.log("newReview:::::::", newReview);
        Promise.all([reviewsDB, newReview]);

        reviewsDB.push(newReview)

        await writeDB(reviewsFilePath, reviewsDB)

        res.status(201).send({ ...req.body })
      }
    } catch (error) {
      next(error)
    }
  }
)

// PUT /projects/id/reviews/id => update this review
router.put("/:rid", async (req, res, next) => {
    try {
      const reviewsDB = await readDB(reviewsFilePath)
      const newDb = reviewsDB.filter(review => review._id !== req.params.rid)
      console.log("newDb.length:::::", newDb.length);
      const modifiedReview = {
        ...req.body,
        _id: req.params.rid,
        modifiedAt: new Date(),
      }
      console.log("modifiedReview::::::", modifiedReview);
    
      await newDb.push(modifiedReview)
      console.log("newDb.length:::::::::", newDb.length)
      await writeDB(reviewsFilePath, newDb)
    
      res.send({ id: modifiedReview._id })
    } catch (error) {
      next(error)
    }
  })

// Delete review: /projects/id/reviews/id
router.delete("/:rid", async (req, res, next) => {
    try {
      const reviewsDB = await readDB(reviewsFilePath)
      const newDb = reviewsDB.filter(review => review._id !== req.params.rid)
      await writeDB(reviewsFilePath, newDb)
  
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })


module.exports = router