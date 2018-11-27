module.exports = flag => {
    let position = process.argv.indexOf(flag);
    if (position === -1) {
      return "";
    }
    return process.argv[position + 1];
}