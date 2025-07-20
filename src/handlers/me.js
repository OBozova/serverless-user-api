exports.handler = async (event) => {
  const user = event.requestContext.authorizer;

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};
