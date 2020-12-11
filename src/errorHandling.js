const notFoundHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 404) {
      res.status(404).send("Not found!")
    }
    next(err)
  }
  
  const unauthorizedHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 401) {
      res.status(401).send("Unauthorized!")
    }
    next(err)
  }
  
  const forbiddenHandler = (err, req, res, next) => {
    if (err.httpStatusCode === 403) {
      res.status(403).send("Forbidden!")
    }
    next(err)
  }
  
  const catchAllHandler = (err, req, res, next) => {
    if (!res.headersSent) {
      res.status(err.httpStatusCode || 500).send("Generic Server Error")
    }
  }
  
  module.exports = {
    notFoundHandler,
    unauthorizedHandler,
    forbiddenHandler,
    catchAllHandler,
  }
  