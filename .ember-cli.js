'use strict';

module.exports = () => {
  const cliConfig = {
    /**
    Ember CLI sends analytics information by default. The data is completely
    anonymous, but there are times when you might want to disable this behavior.

    Setting `disableAnalytics` to true will prevent any data from being sent.
  */
    liveReload: false,
    disableAnalytics: false,
    /**
  Setting `isTypeScriptProject` to true will force the blueprint generators to generate TypeScript
  rather than JavaScript by default, when a TypeScript version of a given blueprint is available.
  */
    isTypeScriptProject: false,
  };

  if (process.env.WATCHER) {
    cliConfig.watcher = process.env.WATCHER;
  }

  return cliConfig;
};
