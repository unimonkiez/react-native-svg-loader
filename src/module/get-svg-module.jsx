import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

class RNSvgLoader extends Component {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fill: PropTypes.string,
    stroke: PropTypes.string,
    renderChildren: PropTypes.func.isRequired,
  };

  static defaultProps = {
    width: undefined,
    height: undefined,
    fill: undefined,
    stroke: undefined,
  }

  render() {
    const {
      width,
      height,
      fill,
      stroke,
      renderChildren,
      ...otherProps
    } = this.props;

    return (
      <View {...otherProps}>
        {renderChildren({
          width,
          height,
          fill,
          stroke,
          })}
      </View>
    );
  }
}

module.exports = SvgComponent => props => (
  <RNSvgLoader
    {...props}
    renderChildren={svgProps => (
      <SvgComponent {...svgProps} />
    )}
  />
);
