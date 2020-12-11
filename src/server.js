const express = require("express")
const listEndpoints = require("express-list-endpoints")
const { join } = require("path")
const cors = require("cors")
const productsRouter = require("./services/products")
const reviewsRouter = require("./services/reviews")
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
} = require("./errorHandling")

const server = express()

const port = process.env.PORT || 3001
const publicFolderPath = join(__dirname, "../public")

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
  next()
}

server.use(cors())
server.use(express.json())
server.use(loggerMiddleware)
server.use(express.static(publicFolderPath))

server.use("/products", productsRouter)
server.use("/reviews", reviewsRouter)

// ERROR HANDLERS

server.use(notFoundHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.log(listEndpoints(server))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
