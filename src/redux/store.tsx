import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension';
import rootReducer from './reducers/index'

const store = createStore(
  rootReducer,
  devToolsEnhancer({
    serialize: true
  })
);

export default store