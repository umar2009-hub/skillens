const REVISION_WEIGHTS = {
  ACCURACY: 0.4,
  CONFIDENCE: 0.3,
  RECENCY: 0.2,
  DNA: 0.1
};

const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30, 60];

const utils = {
  weights: REVISION_WEIGHTS,
  intervals: SPACED_REPETITION_INTERVALS,

  getDaysSince: (dateString) => {
    if (!dateString) return 999;
    const past = new Date(dateString);
    const now = new Date();
    return Math.floor((now - past) / (1000 * 60 * 60 * 24));
  }
};

module.exports = utils;
