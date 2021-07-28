/**
 *
 * @param {*} str
 * Appends a 0 to a string and returns a the last 2 characters of the string
 * Input: '7' or '28'
 * Output: '07' or '28'
 */
const sliceDate = (str) => `0${str}`.slice(-2);

module.exports = {
  sliceDate,
};
