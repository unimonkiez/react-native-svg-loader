# react-native-svg-loader
[![npm version](https://badge.fury.io/js/react-native-svg-loader.svg)](https://badge.fury.io/js/react-native-svg-loader)[![Build Status](https://travis-ci.org/unimonkiez/react-native-svg-loader.svg?branch=master)](https://travis-ci.org/unimonkiez/react-native-svg-loader)

## Parse your svgs in build time and make them compatible with your react-native app.

## Example
### Input
```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
  <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" fill="replace" stroke="replace"/>
  <path d="M0-.5h24v24H0z" fill="none"/>
</svg>
```
### Output
```jsx
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

module.exports = ({ width, height, fill, stroke }) => (
  <Svg fill={"#000000"} width={width} height={height} viewBox={"0 0 24 24"}>
    <Path d={"M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"} fill={fill} stroke={stroke} />
    <Path d={"M0-.5h24v24H0z"} fill={"none"} />
  </Svg>
);
```

## Usage
* Install
  ```bash
  npm install --save-dev self-adjusting-interval
  # or yarn
  yarn add -D self-adjusting-interval
  ```
* Add loader to your `webpack-config`
  ```js
  ...
   module: {
      rules: [
        {
            test: /\.svg$/,
            use: [
              {
                loader: 'react-native-svg-loader',
              },
            ]
        }
      ]
   }
  ```
* Import svgs and use them in your code!
```jsx
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MyLogo from './my-logo.svg';

export default class App extends Component {
  render() {
    return (
      <View>
        <Text>
          Welcome to my React Native app!
        </Text>
        <MyLogo width={40} height={40} />
      </View>
    );
  }
}
```

## Props 
* `width` - Width in `number` of the svg.
* `height` - Height in `number` of the svg
* `fill` - Fill color of the shapes you want (need to give attribute `fill="replace"` in original svg).
* `stroke` - Stroke color of the shapes you want (need to give attribute `fill="replace"` in original svg).
