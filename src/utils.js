const utils = {
  trimFirstRow: str => str.substr(1),
  trimLastRow: str => str.substr(0, str.length - 1),
  trimRows: str => utils.trimFirstRow(utils.trimLastRow(str)),
  camelCase: value => value.replace(/[-:]([a-z])/g, g => g[1].toUpperCase()),
  camelCaseNodeName: ({ nodeName, nodeValue }) => ({
    nodeName: utils.camelCase(nodeName),
    nodeValue,
  }),
  removePixelsFromNodeValue: ({ nodeName, nodeValue }) => ({ nodeName, nodeValue: nodeValue.replace('px', '') }),
  transformStyle: ({ nodeName, nodeValue, fillProp }) => {
    if (nodeName === 'style') {
      return nodeValue.split(';')
        .reduce((acc, attribute) => {
          const [property, value] = attribute.split(':');
          if (property === '') {
            return acc;
          }
          return { ...acc, [utils.camelCase(property)]: fillProp && property === 'fill' ? fillProp : value };
        }, {});
    }
    return null;
  },
  getEnabledAttributes: enabledAttributes => ({ nodeName }) => (
    enabledAttributes.includes(utils.camelCase(nodeName))
  ),
};

module.exports = utils;
