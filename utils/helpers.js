const extractErrorsArray = (errorsArray) => {
  const errorsToReturn = {};

  errorsArray.forEach(error => {
    errorsToReturn[error.path] = error.msg;
  });

  return errorsToReturn;
};

export {
  extractErrorsArray
};
