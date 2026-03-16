import { library, dom, config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import * as freeSolidIcons from '@fortawesome/free-solid-svg-icons';
import * as freeRegularIcons from '@fortawesome/free-regular-svg-icons';

library.add(freeSolidIcons['fas']);
library.add(freeRegularIcons['far']);

// Disable auto CSS import into head.
config.autoAddCss = false;

// Transform legacy <i> icons to SVG.
config.autoReplaceSvg = true;
config.observeMutations = true;
dom.watch();
