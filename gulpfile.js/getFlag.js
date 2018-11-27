module.exports = flag => {
    let position = argv.indexOf(flag);
    if (position === -1) {
      return "";
    }
    return argv[position + 1];
}