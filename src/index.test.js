const loader = require('./index');

const svgInput = `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24">
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" fill="replace"/>
    <path d="M0-.5h24v24H0z" fill="none"/>
</svg>`;

describe('loader', () => {
  it('svg is returning text', () => {
    const svgComponent = loader(svgInput);
    expect(typeof svgComponent).toBe('string');
    expect(svgComponent.length).toBeGreaterThan(0);
  });
});

