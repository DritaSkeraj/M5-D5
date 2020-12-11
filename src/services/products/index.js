const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../../lib/utilites")
const { check, validationResult } = require("express-validator")

const router = express.Router()
const productsFilePath = path.join(__dirname, "products.json")

router.get("/:id", async (req, res, next) => {
    try {
      const productsDB = await readDB(productsFilePath)
      const product = productsDB.filter(product => product._id === req.params.id)
      if (product.length > 0) {
        res.send(product)
      } else {
        const err = new Error()
        err.httpStatusCode = 404
        next(err)
      }
    } catch (error) {
      next(error)
    }
  })

  router.get("/", async (req, res, next) => {
    try {
      const productsDB = await readDB(productsFilePath)
      if (req.query && req.query.name) {
        const filteredProducts = productsDB.filter(
          product =>
            product.hasOwnProperty("name") &&
            product.name.toLowerCase() === req.query.name.toLowerCase()
        )
        res.send(filteredProducts)
      } else {
        res.send(productsDB)
      }
    } catch (error) {
      next(error)
    }
  })

  router.post(
    "/",
    [
      check("name")
        .exists()
        .withMessage("Add a name for the product please!"),
        check("description")
          .exists()
          .withMessage("Provide a description please!"),
        check("brand")
          .exists()
          .withMessage("Add the brand please!"),
      check('price')
        .exists()
        .withMessage('Provide the price')
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
          const productsDB = await readDB(productsFilePath)
          const newProduct = {
            ...req.body,
            _id: uniqid(),
            createdAt: new Date(),
          }
  
          productsDB.push(newProduct)
  
          await writeDB(productsFilePath, productsDB)
  
          res.status(201).send({ id: newProduct._id })
        }
      } catch (error) {
        next(error)
      }
    }
  )

  router.delete("/:id", async (req, res, next) => {
    try {
      const productsDB = await readDB(productsFilePath)
      const newDb = productsDB.filter(product => product._id !== req.params.id)
      await writeDB(productsFilePath, newDb)
  
      res.status(204).send("Product deleted successfully!")
    } catch (error) {
      next(error)
    }
  })

  router.put("/:id", async (req, res, next) => {
    try {
      const productsDB = await readDB(productsFilePath)
      const newDb = productsDB.filter(product => product._id !== req.params.id)
  
      const modifiedProduct = {
        ...req.body,
        _id: req.params.id,
        modifiedAt: new Date(),
      }
  
      newDb.push(modifiedProduct)
      await writeDB(productsFilePath, newDb)
  
      res.send({ id: modifiedProduct._id })
    } catch (error) {
      next(error)
    }
  })

  module.exports = router
  