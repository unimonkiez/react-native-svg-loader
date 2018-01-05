const fs = require('fs');
const path = require('path');
const loader = require('./index');

const svgPath = path.resolve(__dirname, 'test-example.svg');

const svgInput = fs.readFileSync(svgPath).toString();

const svgComponent = loader(svgInput);

console.log(svgComponent);

// describe('test', () => {
//   it('1===1', () => {
//     expect(1).toBe(1);
//   });
// });

