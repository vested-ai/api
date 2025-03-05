exports.hello = async (event) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v4.0! Your function executed successfully!'
      })
    };
  } catch (error) {
    console.error('Error executing function: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      })
    };
  }
};
