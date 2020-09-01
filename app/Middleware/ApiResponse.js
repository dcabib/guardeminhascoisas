module.exports = () => {
  console.debug ("### ApiResponse - start");

  return ({
    after: (handler, next) => {
      console.debug ("### ApiResponse - after - starting");

      if (handler) {
        console.debug ("### ApiResponse - after - There is handler information");

        handler.response = {
          statusCode: handler.response.statusCode || 200,
          body: JSON.stringify({
            message: handler.response.message || 'Success',
            data: handler.response.data,
          }),
        };
      } else {
        console.debug ("### ApiResponse - after - There is NO handler information");
      }
      console.debug ("### ApiResponse - after - Calling Next");
      next();
    },
    onError: (handler, next) => {
      console.debug ("### ApiResponse - onError - starting");
      //console.debug ("### ApiResponse - onError - Handler: " + handler);

      if (handler) {
        
        console.debug ("### ApiResponse - onError - There is handler information");
        handler.response = {
          statusCode: handler.response.statusCode || 500,
          body: JSON.stringify({
            message: handler.error.message || 'Error',
            data: handler.response.body.data || null,
          }),
        };
      } else {
        console.debug ("### ApiResponse - onError - There is NO handler information");
      }
      console.debug ("### ApiResponse - onError - Calling Next");
      next();
    }
  })
}
