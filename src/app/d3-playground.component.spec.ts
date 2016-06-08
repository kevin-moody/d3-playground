import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { D3PlaygroundAppComponent } from '../app/d3-playground.component';

beforeEachProviders(() => [D3PlaygroundAppComponent]);

describe('App: D3Playground', () => {
  it('should create the app',
      inject([D3PlaygroundAppComponent], (app: D3PlaygroundAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'d3-playground works!\'',
      inject([D3PlaygroundAppComponent], (app: D3PlaygroundAppComponent) => {
    expect(app.title).toEqual('d3-playground works!');
  }));
});
