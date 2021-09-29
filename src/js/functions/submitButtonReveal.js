function submitButtonReveal(viewName, formData) {
  switch (viewName) {
    case "Create New Vacancy":
      return formData.Doyouneedtohiretemporarycoverinthemeantime ? true : false;
    default:
      return true;
  }
}

export { submitButtonReveal };
