const utils = require('./utils');

const usePropValue = 'USE_PROP';

const getInnerTransformations = jsx => (jsx ? {
  getAttsString(atts) {
    return Object.keys(atts)
      .map((attName) => {
        const attValue = atts[attName];
        if (attValue === usePropValue) {
          return `${attName}={${attName}}`;
        }
        return `${attName}={${JSON.stringify(attValue)}}`;
      })
      .join(' ');
  },
} : {
  getAttsString(atts) {
    return Object.keys(atts)
      .map((attName) => {
        const attValue = atts[attName];
        if (attValue === usePropValue) {
          return `${attName}: ${attName}`;
        }
        return `${attName}: ${JSON.stringify(attValue)}`;
      })
      .join(', ');
  },
});

module.exports = (jsx) => {
  const innerTransformations = getInnerTransformations(jsx);

  return (jsx ? {
    getCreateText({ value, level }) {
      const spaceStr = ' '.repeat((level + 1) * 2);

      return `${spaceStr}${value}`;
    },
    getCreateElement({
      level,
      componentName,
      componentAtts,
      childs,
    }) {
      const spaceStr = ' '.repeat((level + 1) * 2);
      const attSpace = Object.keys(componentAtts).length === 0 ? '' : ' ';

      const componentStartTag = `${spaceStr}<${componentName}${attSpace}${innerTransformations.getAttsString(componentAtts)}`;

      if (childs.length === 0) {
        return `${componentStartTag} />`;
      }
      return utils.trimRows(`
${componentStartTag}>
${childs.join('\n')}
${spaceStr}</${componentName}>
`);
    },
    getModuleBody(rootSVG) {
      return utils.trimFirstRow(`
import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
  TSpan,
  Defs,
  Stop
} from 'react-native-svg';
import getSvgComponent from 'react-native-svg-loader/lib/get-svg-component';

const SvgRoughComponent = ({ width, height, fill, stroke }) => (
${rootSVG}
);

module.exports = getSvgComponent(SvgRoughComponent);
`);
    },
  } : {
    getCreateText({ value, level }) {
      const spaceStr = ' '.repeat((level + 2) * 2);

      return `${spaceStr}${JSON.stringify(value)}`;
    },
    getCreateElement({
      level,
      componentName,
      componentAtts,
      childs,
    }) {
      const hasAttrs = Object.keys(componentAtts).length !== 0;
      const hasChilds = childs.length !== 0;
      const spaceStr = ' '.repeat((level + 2) * 2);
      const spaceStrParams = spaceStr + ' '.repeat(2);

      return utils.trimFirstRow(`
${spaceStr}React.createElement(
${spaceStrParams}${componentName},
${spaceStrParams}${(!hasAttrs) ? 'null' : `{ ${innerTransformations.getAttsString(componentAtts)} }`}${hasChilds ? ',' : ''}
${(!hasChilds) ? `${spaceStr})` : childs.join(',\n')}${(hasChilds) ? `\n${spaceStr})` : ''}`);
    },
    getModuleBody(rootSVG) {
      return utils.trimFirstRow(`
var React = require('react');
var ReactNativeSvg = require('react-native-svg');
var getSvgComponent = require('react-native-svg-loader/lib/get-svg-component');

var Svg = ReactNativeSvg.default;
var Circle = ReactNativeSvg.Circle;
var Ellipse = ReactNativeSvg.Ellipse;
var G = ReactNativeSvg.G;
var LinearGradient = ReactNativeSvg.LinearGradient;
var RadialGradient = ReactNativeSvg.RadialGradient;
var Line = ReactNativeSvg.Line;
var Path = ReactNativeSvg.Path;
var Polygon = ReactNativeSvg.Polygon;
var Polyline = ReactNativeSvg.Polyline;
var Rect = ReactNativeSvg.Rect;
var Text = ReactNativeSvg.Text;
var TSpan = ReactNativeSvg.TSpan;
var Defs = ReactNativeSvg.Defs;
var Stop = ReactNativeSvg.Stop;

function SvgRoughComponent(props) {
  var width = props.width;
  var height = props.height;
  var fill = props.fill;
  var stroke = props.stroke;

  return (
${rootSVG}
  );
}

module.exports = getSvgComponent(SvgRoughComponent);
`);
    },
  });
};
