module.exports = () => {
  // console.info ("ApiResponse - start");

  return ({
    after: (handler, next) => {
      // console.info ("ApiResponse - after - dentro");

      handler.response = {
        statusCode: handler.response.statusCode || 200,
        body: JSON.stringify({
          message: handler.response.message || 'Success',
          data: handler.response.data,
        }),
      };
      next();
    },
    onError: (handler, next) => {
      // console.info ("ApiResponse onError");
      // console.log(handler);
      handler.response = {
        statusCode: handler.response.statusCode || 500,
        body: JSON.stringify({
          message: handler.error.message || 'Error',
          data: handler.response.body.data || null,
        }),
      };
      next();
    }
  })
}
