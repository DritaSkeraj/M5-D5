const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const fs = require("fs")
const  {writeFile,createReadStream} = require("fs-extra")
const { readDB, writeDB } = require("../../lib/utilites")
const { check, validationResult } = require("express-validator")
const multer = require("multer")

const router = express.Router()
const productsFilePath = path.join(__dirname, "products.json")

const {pipeline} = require("stream")

const upload = multer({})



const readFile = fileName =>{

    const buffer = fs.readFileSync(path.join(__dirname,fileName))
    const fileContent = buffer.toString()
    return JSON.parse(fileContent)
}
productsFileImgPath= path.join(__dirname,"../../../public/img/products") // file i produktve i fshijna masi i krym komentet shqip


const addImgpProperty = async (id,imgpath)=>{
  const productsArray = readFile("products.json");
    let product = productsArray.find((product)=>product._id ===id)
   
        product.imageURL = imgpath;

        fs.writeFileSync(path.join(__dirname,"products.json"),JSON.stringify(productsArray))
   
}
router.post("/:id/upload",upload.single("product"), async (req,res,next)=>{

    try {
      console.log(req.params.id,"---deti---")
      addImgpProperty(req.params.id,`http://localhost:3001//img/products/`+`${req.params.id}.jpg`)
    
        await writeFile(
            path.join(productsFileImgPath,`${req.params.id}.jpg`),
            req.file.buffer
        )
        res.status(201).send("uploaded")
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.post("/uploadMultiple",upload.array("multiple",8),async (req,res,next)=>{
    try {
        const arrayOfPromises = req.file.map(file=>
            writeFile(path.join(productsFileImgPath,req.file.originalname),req.file.buffer)
            )
            await Promise.all(arrayOfPromises)
            res.send("uploaded")
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.get("/:name/download",async (req,res,next)=>{
    const source = createReadStream(
        path.join(productsFileImgPath,`${req.params.name}`)
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.name}.gz`
    )
    pipeline(source,zlib.createGzip(),res,error =>next(error))
})

//////////////////////////////////////////////////////

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
      if (req.query && req.query.category) {
        const filteredProducts = productsDB.filter(
          product =>
            product.hasOwnProperty("category") &&
            product.category.toLowerCase() === req.query.category.toLowerCase()
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
  