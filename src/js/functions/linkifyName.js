const linkifyName = (Name) => {
  return Name.toLowerCase().replace(/\s+/g, "-");
};

export default linkifyName;
