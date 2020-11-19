import DEFAULTS from './defaults';

import {
  resolveTarget,
  createCanvasHTMLElement,
  getCanvasContext,
  mountCanvasToDOM,
  randomID,
} from './domUtils';

import { createContextHistory } from './createContextHistory';
import { createObservableContext } from './createObservableContext';
import { observeElDimensions } from './observeElDimensions';
import { setCanvasHTMLElementDimensions } from './setCanvasHTMLElementDimensions';
import { transformContextMatrix } from './transformContextMatrix';
import { restoreFromHistory } from './restoreFromHistory';
import { createCanvasStyleSheet } from './styles';

function create(opts) {
  opts = Object.assign(DEFAULTS, opts);
  opts.target = resolveTarget(opts.target);

  const canvasID = randomID();

  const history = createContextHistory();

  const canvasHTMLElement = createCanvasHTMLElement(canvasID);
  const canvasStyleSheet = createCanvasStyleSheet(canvasID);

  const baseContext = getCanvasContext(canvasHTMLElement);
  const observableContext = createObservableContext(
    baseContext,
    (type, name, args) => {
      history.push(type, name, args);
    }
  );

  function resizeCanvas() {
    setCanvasHTMLElementDimensions({
      id: canvasID,
      el: canvasHTMLElement,
      autoAspectRatio: opts.autoAspectRatio,
      viewBox: opts.viewBox,
      resolution: opts.resolution,
      styleSheet: canvasStyleSheet,
    });

    transformContextMatrix({
      ctx: baseContext,
      viewBox: opts.viewBox,
      resolution: opts.resolution,
      scaleMode: opts.scaleMode,
    });

    if (opts.static) {
      restoreFromHistory(baseContext, history);
    }
  }

  mountCanvasToDOM(opts.target, canvasHTMLElement);

  resizeCanvas();

  observeElDimensions(canvasHTMLElement, resizeCanvas);

  return {
    el: canvasHTMLElement,
    ctx: opts.static ? observableContext : baseContext,
  };
}

export { create };
