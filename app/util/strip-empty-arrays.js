/**
 * Remove empty array values from a JSON object. Keys that have a value of an empty
 * array will be removed. Does not dive into object values.
 *
 * @param {JSONObject} object
 */
export default function (object) {
  Object.keys(object)
    .filter((key) => Array.isArray(object[key]) && object[key].length === 0)
    .forEach((key) => {
      delete object[key];
    });
  return object;
}
