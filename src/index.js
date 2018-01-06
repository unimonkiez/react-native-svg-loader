const utils = require('./utils');
const getStringCreation = require('./string-creation');
const xmldom = require('xmldom');

const stringCreation = getStringCreation(false);

const ACCEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'rect',
  'defs',
  'line',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
  'polygon',
  'polyline',
  'text',
  'tspan',
];

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox', 'width', 'height'];
const G_ATTS = ['id'];

const CIRCLE_ATTS = ['cx', 'cy', 'r'];
const PATH_ATTS = ['d'];
const RECT_ATTS = ['width', 'height'];
const LINE_ATTS = ['x1', 'y1', 'x2', 'y2'];
const LINEARG_ATTS = LINE_ATTS.concat(['id', 'gradientUnits']);
const RADIALG_ATTS = CIRCLE_ATTS.concat(['id', 'gradientUnits']);
const STOP_ATTS = ['offset', 'stopColor'];
const ELLIPSE_ATTS = ['cx', 'cy', 'rx', 'ry'];

const TEXT_ATTS = ['fontFamily', 'fontSize', 'fontWeight'];

const POLYGON_ATTS = ['points'];
const POLYLINE_ATTS = ['points'];

const COMMON_ATTS = [
  'fill',
  'fillOpacity',
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  'opacity',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeDasharray',
  'strokeDashoffset',
  'x',
  'y',
  'rotate',
  'scale',
  'origin',
  'originX',
  'originY',
  'transform',
  'xlinkHref',
];

const trimElementChilden = children => children.filter(child => (typeof child === 'string' && child.trim.length === 0));

const usePropValue = 'USE_PROP';

const getTrasnformValueByString = (value) => {
  const regex = /([^ ]*)\(([^()]*(?=\)))/g; // transform(1, 2) => transform(1, 2

  return value.match(regex).reduce((obj, match) => {
    const [transformName, transformValue] = match.split('(');

    return Object.assign(
      {},
      obj,
      {
        [transformName]: transformValue,
      },
    );
  }, {});
};

const obtainComponentAtts = ({ attributes }, enabledAttributes) => {
  const styleAtts = {};
  Array.from(attributes).forEach(({ nodeName, nodeValue }) => {
    Object.assign(styleAtts, utils.transformStyle({
      nodeName,
      nodeValue,
    }));
  });

  const componentAtts = Array.from(attributes)
    .map(utils.camelCaseNodeName)
    .map(utils.removePixelsFromNodeValue)
    .filter(utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
    .reduce((acc, { nodeName, nodeValue }) => {
      let value;
      if (['fill', 'stroke'].indexOf(nodeName) !== -1 && nodeValue === 'replace') {
        value = usePropValue;
      } else if (nodeName === 'transform') {
        value = getTrasnformValueByString(nodeValue);
      } else {
        value = nodeValue;
      }
      acc[nodeName] = value;
      return acc;
    }, {});
  Object.assign(componentAtts, styleAtts);

  return componentAtts;
};

const fixYPosition = (y, node) => {
  if (node.attributes) {
    const fontSizeAttr = Object.keys(node.attributes).find(a => node.attributes[a].name === 'font-size');
    if (fontSizeAttr) {
      return `${parseFloat(y) - parseFloat(node.attributes[fontSizeAttr].value)}`;
    }
  }
  if (!node.parentNode) {
    return y;
  }
  return fixYPosition(y, node.parentNode);
};

const createSVGElement = (node, nonTrimmedChilds, level = 0) => {
  const childs = trimElementChilden(nonTrimmedChilds);
  let componentName;
  let componentAttsNames = [];
  switch (node.nodeName) {
    case 'svg':
      componentName = 'Svg';
      componentAttsNames = SVG_ATTS;
      break;
    case 'g':
      componentName = 'G';
      componentAttsNames = G_ATTS;
      break;
    case 'path':
      componentName = 'Path';
      componentAttsNames = PATH_ATTS;
      break;
    case 'circle':
      componentName = 'Circle';
      componentAttsNames = CIRCLE_ATTS;
      break;
    case 'rect':
      componentName = 'Rect';
      componentAttsNames = RECT_ATTS;
      break;
    case 'line':
      componentName = 'Line';
      componentAttsNames = LINE_ATTS;
      break;
    case 'defs':
      componentName = 'Defs';
      break;
    case 'linearGradient':
      componentName = 'LinearGradient';
      componentAttsNames = LINEARG_ATTS;
      break;
    case 'radialGradient':
      componentName = 'RadialGradient';
      componentAttsNames = RADIALG_ATTS;
      break;
    case 'stop':
      componentName = 'Stop';
      componentAttsNames = STOP_ATTS;
      break;
    case 'ellipse':
      componentName = 'Ellipse';
      componentAttsNames = ELLIPSE_ATTS;
      break;
    case 'polygon':
      componentName = 'Polygon';
      componentAttsNames = POLYGON_ATTS;
      break;
    case 'polyline':
      componentName = 'Polyline';
      componentAttsNames = POLYLINE_ATTS;
      break;
    case 'text':
      componentName = 'Text';
      componentAttsNames = TEXT_ATTS;
      break;
    case 'tspan':
      componentName = 'TSpan';
      componentAttsNames = TEXT_ATTS;
      break;
    default:
  }

  const componentAtts = obtainComponentAtts(node, componentAttsNames);

  if (node.nodeName === 'svg') {
    componentAtts.width = usePropValue;
    componentAtts.height = usePropValue;
  }

  if (['text', 'tspan'].indexOf(node.nodeName) !== -1 && componentAtts.y) {
    componentAtts.y = fixYPosition(componentAtts.y, node);
  }

  return stringCreation.getCreateElement({
    level,
    componentName,
    componentAtts,
    childs,
  });
};

const inspectNode = (node, level = 0) => {
  // Only process accepted elements
  if (!ACCEPTED_SVG_ELEMENTS.includes(node.nodeName)) {
    return null;
  }

  // Process the xml node
  const arrayElements = [];

  // if have children process them.
  // Recursive function.
  if (node.childNodes && node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i += 1) {
      const isTextValue = node.childNodes[i].nodeValue;
      let nodo;
      if (isTextValue) {
        nodo = stringCreation.getCreateText({
          value: node.childNodes[i].nodeValue,
          level: level + 1,
        });
      } else {
        nodo = inspectNode(node.childNodes[i], level + 1);
      }

      if (nodo != null) {
        arrayElements.push(nodo);
      }
    }
  }

  return createSVGElement(node, arrayElements, level);
};

const getClassStringBySvgString = (svgString) => {
  const inputSvg = svgString.substring(
    svgString.indexOf('<svg '),
    (svgString.indexOf('</svg>') + 6),
  );

  const doc = new xmldom.DOMParser().parseFromString(inputSvg);
  const rootSVG = inspectNode(doc.childNodes[0]);

  return stringCreation.getModuleBody(rootSVG);
};

module.exports = source => getClassStringBySvgString(source);
