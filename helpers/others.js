/**
 * Levenshtein distance:
 *     Get the distance between 2 words the smaller the better (0 mean equals)
 * @param  {String} a
 * @param  {String} b
 * @return {Number} (Distance between a,b)
 */
module.exports.getDistance = function(a, b) {
  if (a.length === 0 || b.length === 0) return b.length + a.length;
  if (a === b) return 0;

  var i, j, matrix = [];

  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                Math.min(matrix[i][j - 1] + 1, // insertion
                                         matrix[i - 1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};
