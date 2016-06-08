import { D3PlaygroundPage } from './app.po';

describe('d3-playground App', function() {
  let page: D3PlaygroundPage;

  beforeEach(() => {
    page = new D3PlaygroundPage();
  })

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('d3-playground works!');
  });
});
