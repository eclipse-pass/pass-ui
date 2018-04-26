// import Component from '@ember/component';
import Ember from 'ember';

function fuzzySet(arr, useLevenshtein, gramSizeLower, gramSizeUpper) {
  const fuzzyset = {

  };

    // default options
  arr = arr || [];
  fuzzyset.gramSizeLower = gramSizeLower || 2;
  fuzzyset.gramSizeUpper = gramSizeUpper || 3;
  fuzzyset.useLevenshtein = (typeof useLevenshtein !== 'boolean') ? true : useLevenshtein;

  // define all the object functions and attributes
  fuzzyset.exactSet = {};
  fuzzyset.matchDict = {};
  fuzzyset.items = {};

  // helper functions
  const levenshtein = function (str1, str2) {
    let current = [],
      prev,
      value;

    for (let i = 0; i <= str2.length; i++) {
      for (let j = 0; j <= str1.length; j++) {
        if (i && j) {
          if (str1.charAt(j - 1) === str2.charAt(i - 1)) { value = prev; } else { value = Math.min(current[j], current[j - 1], prev) + 1; }
        } else { value = i + j; }

        prev = current[j];
        current[j] = value;
      }
    }

    return current.pop();
  };

    // return an edit distance from 0 to 1
  const _distance = function (str1, str2) {
    if (str1 === null && str2 === null) throw 'Trying to compare two null values';
    if (str1 === null || str2 === null) return 0;
    str1 = String(str1); str2 = String(str2);

    const distance = levenshtein(str1, str2);
    if (str1.length > str2.length) {
      return 1 - distance / str1.length;
    }
    return 1 - distance / str2.length;
  };
  const _nonWordRe = /[^a-zA-Z0-9\u00C0-\u00FF, ]+/g;

  const _iterateGrams = function (value, gramSize) {
    gramSize = gramSize || 2;
    let simplified = `-${value.toLowerCase().replace(_nonWordRe, '')}-`,
      lenDiff = gramSize - simplified.length,
      results = [];
    if (lenDiff > 0) {
      for (var i = 0; i < lenDiff; ++i) {
        value += '-';
      }
    }
    for (var i = 0; i < simplified.length - gramSize + 1; ++i) {
      results.push(simplified.slice(i, i + gramSize));
    }
    return results;
  };

  const _gramCounter = function (value, gramSize) {
    // return an object where key=gram, value=number of occurrences
    gramSize = gramSize || 2;
    let result = {},
      grams = _iterateGrams(value, gramSize),
      i = 0;
    for (i; i < grams.length; ++i) {
      if (grams[i] in result) {
        result[grams[i]] += 1;
      } else {
        result[grams[i]] = 1;
      }
    }
    return result;
  };

    // the main functions
  fuzzyset.get = function (value, defaultValue, minMatchScore) {
    // check for value in set, returning defaultValue or null if none found
    if (minMatchScore === undefined) {
      minMatchScore = 0.33;
    }
    const result = this._get(value, minMatchScore);
    if (!result && typeof defaultValue !== 'undefined') {
      return defaultValue;
    }
    return result;
  };

  fuzzyset._get = function (value, minMatchScore) {
    let normalizedValue = this._normalizeStr(value),
      result = this.exactSet[normalizedValue];
    if (result) {
      return [[1, result]];
    }

    let results = [];
    // start with high gram size and if there are no results, go to lower gram sizes
    for (let gramSize = this.gramSizeUpper; gramSize >= this.gramSizeLower; --gramSize) {
      results = this.__get(value, gramSize, minMatchScore);
      if (results && results.length > 0) {
        return results;
      }
    }
    return null;
  };

  fuzzyset.__get = function (value, gramSize, minMatchScore) {
    var normalizedValue = this._normalizeStr(value),
      matches = {},
      gramCounts = _gramCounter(normalizedValue, gramSize),
      items = this.items[gramSize],
      sumOfSquareGramCounts = 0,
      gram,
      gramCount,
      i,
      index,
      otherGramCount;

    for (gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if (gram in this.matchDict) {
        for (i = 0; i < this.matchDict[gram].length; ++i) {
          index = this.matchDict[gram][i][0];
          otherGramCount = this.matchDict[gram][i][1];
          if (index in matches) {
            matches[index] += gramCount * otherGramCount;
          } else {
            matches[index] = gramCount * otherGramCount;
          }
        }
      }
    }

    function isEmptyObject(obj) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) { return false; }
      }
      return true;
    }

    if (isEmptyObject(matches)) {
      return null;
    }

    let vectorNormal = Math.sqrt(sumOfSquareGramCounts),
      results = [],
      matchScore;
    // build a results list of [score, str]
    for (const matchIndex in matches) {
      matchScore = matches[matchIndex];
      results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
    }
    const sortDescending = function (a, b) {
      if (a[0] < b[0]) {
        return 1;
      } else if (a[0] > b[0]) {
        return -1;
      }
      return 0;
    };
    results.sort(sortDescending);
    if (this.useLevenshtein) {
      var newResults = [],
        endIndex = Math.min(50, results.length);
      // truncate somewhat arbitrarily to 50
      for (var i = 0; i < endIndex; ++i) {
        newResults.push([_distance(results[i][1], normalizedValue), results[i][1]]);
      }
      results = newResults;
      results.sort(sortDescending);
    }
    var newResults = [];
    results.forEach((scoreWordPair) => {
      if (scoreWordPair[0] >= minMatchScore) {
        newResults.push([scoreWordPair[0], this.exactSet[scoreWordPair[1]]]);
      }
    });
    return newResults;
  };

  fuzzyset.add = function (value) {
    const normalizedValue = this._normalizeStr(value);
    if (normalizedValue in this.exactSet) {
      return false;
    }

    let i = this.gramSizeLower;
    for (i; i < this.gramSizeUpper + 1; ++i) {
      this._add(value, i);
    }
  };

  fuzzyset._add = function (value, gramSize) {
    let normalizedValue = this._normalizeStr(value),
      items = this.items[gramSize] || [],
      index = items.length;

    items.push(0);
    let gramCounts = _gramCounter(normalizedValue, gramSize),
      sumOfSquareGramCounts = 0,
      gram,
      gramCount;
    for (gram in gramCounts) {
      gramCount = gramCounts[gram];
      sumOfSquareGramCounts += Math.pow(gramCount, 2);
      if (gram in this.matchDict) {
        this.matchDict[gram].push([index, gramCount]);
      } else {
        this.matchDict[gram] = [[index, gramCount]];
      }
    }
    const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
    items[index] = [vectorNormal, normalizedValue];
    this.items[gramSize] = items;
    this.exactSet[normalizedValue] = value;
  };

  fuzzyset._normalizeStr = function (str) {
    if (Object.prototype.toString.call(str) !== '[object String]') throw 'Must use a string as argument to FuzzySet functions';
    return str.toLowerCase();
  };

  // return length of items in set
  fuzzyset.length = function () {
    let count = 0,
      prop;
    for (prop in this.exactSet) {
      if (this.exactSet.hasOwnProperty(prop)) {
        count += 1;
      }
    }
    return count;
  };

  // return is set is empty
  fuzzyset.isEmpty = function () {
    for (const prop in this.exactSet) {
      if (this.exactSet.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  };

  // return list of values loaded into set
  fuzzyset.values = function () {
    let values = [],
      prop;
    for (prop in this.exactSet) {
      if (this.exactSet.hasOwnProperty(prop)) {
        values.push(this.exactSet[prop]);
      }
    }
    return values;
  };


  // initialization
  let i = fuzzyset.gramSizeLower;
  for (i; i < fuzzyset.gramSizeUpper + 1; ++i) {
    fuzzyset.items[i] = [];
  }
  // add all the items to the set
  for (i = 0; i < arr.length; ++i) {
    fuzzyset.add(arr[i]);
  }

  return fuzzyset;
}


export default Ember.Component.extend({
  didRender() {
    this._super(...arguments);
    const that = this;
    const originalForm = this.get('schema');
    const newForm = JSON.parse(JSON.stringify(originalForm));
    if (!originalForm.options) {
      newForm.options = {};
    }
    let metadata = JSON.parse(this.get('model.metadata'));
    if (newForm.id) {
      // Populate form with data if there is any to populate with.
      if (!metadata) {
        metadata = [];
      }
      // if there has been no user input fuzzy match the keys

      let shouldFuzzyMatch = true;
      metadata.forEach((data) => {
        if (data.id == newForm.id) {
          shouldFuzzyMatch = false;
          newForm.data = data.data;
        }
      });

      if (shouldFuzzyMatch) { // need to fix This
        const prePopulateData = {};
        //  Try to match the doiInfo to the form schema data to populate
        Promise.resolve(originalForm.schema).then((schema) => {
          try {
            const doiInfo = this.get('doiInfo');
            // // Fuzy Match here
            const f = fuzzySet(Object.keys(schema.properties));
            for (const doiEntry in doiInfo) {
              // Validate and check any doi data to make sure its close to the right field
              if (f.get(doiEntry) !== null) {
                if (doiEntry == 'author') {
                  const given = doiInfo[doiEntry][0].given;
                  prePopulateData[f.get(doiEntry)[0][1]] = given;

                  const family = doiInfo[doiEntry][0].family;
                  prePopulateData.family = family;
                } else if (doiInfo[doiEntry].length > 0) {
                  // Predicts data with .61 accuracy
                  if (f.get(doiEntry)[0][0] > 0.61) {
                    console.log(doiEntry, doiInfo[doiEntry], f.get(doiEntry)[0][0]);
                    // set the found record to the metadata
                    prePopulateData[f.get(doiEntry)[0][1]] = doiInfo[doiEntry];
                  }
                }
              }
            }
            newForm.data = prePopulateData;
            metadata[newForm.id] = ({
              id: newForm.id,
              data: prePopulateData,
            });
            this.set('model.metadata', metadata);
          } catch (e) { console.log(e); }
        });
      }
    }
    // form ctrls
    newForm.options.form = {
      buttons: {
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary',
          click() {
            const value = this.getValue();
            const formId = newForm.id;
            // metadata[formId] = [];
            // if (!metadata[formId]) {
            //   metadata.push({
            //     id: formId,
            //     data: value,
            //   });
            // } else {
            //   metadata[formId] = ({
            //     id: formId,
            //     data: value,
            //   });
            // }
            //
            // // Save the metadata to the model
            // let forEachCallBack = true;
            // metadata.forEach((data)=>{
            //   forEachCallBack = false;
            //   console.log('IN FOREACH')
            //   if(data.id == metadata[formId].id) { // duplicates found write over duplicate with new data
            //     console.log(hasDuplicates(metadata))
            //     console.log('heyyyy ohh we found a dup')
            //     metadata[formId] = ({
            //       id: formId,
            //       data: value,
            //     });
            //   } else { // no duplicates found
            //     console.log('no dups found')
            //     metadata.push({
            //       id: formId,
            //       data: value,
            //     });
            //   }
            // })
            // if(forEachCallBack) { // for didnt run so push on to array
            //   console.log('IN forEachCallBack')
            //   metadata.push({
            //     id: formId,
            //     data: value,
            //   });
            // }


            // console.log(hasDuplicates(metadata))
            // metadata = removeDuplicates(metadata)
            metadata.push({
              id: formId,
              data: value,
            });
            // remove any duplicates
            let uniqIds = {},
              source = metadata;
            // eslint-disable-next-line no-return-assign
            let filtered = source.reverse().filter(obj => !uniqIds[obj.id] && (uniqIds[obj.id] = true));

            that.set('model.metadata', JSON.stringify(filtered));
            that.nextForm();
          },
        },
        Back: {
          title: 'Back',
          click() {
            that.previousForm();
          },
        },
      },
    };

    $(document).ready(() => {
      $('#schemaForm').empty();
      $('#schemaForm').alpaca(newForm);
    });
  },
  actions: {
    nextForm() {
      this.sendAction('nextForm');
    },
    previousForm() {
      this.sendAction('previousForm');
    },
  },
});
