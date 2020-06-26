module.exports = {
  dispatch: function(line) {
    // For now, just print it out
    this.print(line);
  },
  print: function(line) {
    console.log(line);
  }
};
