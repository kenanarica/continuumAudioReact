import React from 'react';
import { render } from 'react-dom';

import WARecorder from './war_react';

const domContainer = document.querySelector('#recorder_container');
render(<WARecorder />, domContainer);
