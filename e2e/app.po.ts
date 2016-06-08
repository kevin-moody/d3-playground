export class D3PlaygroundPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('d3-playground-app h1')).getText();
  }
}
