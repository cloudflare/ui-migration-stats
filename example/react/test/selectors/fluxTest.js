/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import Counter from '../../../flux-storemvc/src/data/Counter';
import store from '../../../flux-storemvc/src/data/store';
import storeActionTypes from '../../../flux-storemvc/src/data/storeActionTypes';
import storeStore from '../../../flux-storemvc/src/data/storeStore';

describe('storeStore', function() {
  // Before each test case we set up some helper functions that makes the tests
  // easier to read. It's okay to have a fair amount of helper functions as long
  // as they make the tests simpler to read and write. Depending on the
  // complexity of your store it is perfectly reasonable to factor these out
  // into a separate `storeTestHelpers.js` file that can be reused -- and then
  // you could write tests for the helpers too! :P (we actually do this for our
  // main stores)
  beforeEach(function() {
    // Always start with the initial state.
    this.state = storeStore.getInitialState();

    // This function gets a more readable form of the stores that we can pass
    // to expect().
    this.stores = () =>
      Array.from(this.state.values()).map(store => ({
        text: store.text,
        complete: !!store.complete
      }));

    // This function is for setting up data, it will add all the stores to the
    // state in a direct way.
    this.addstores = stores => {
      stores.forEach(store => {
        const id = Counter.increment();
        this.state = this.state.set(
          id,
          new store({ id, text: store.text, complete: !!store.complete })
        );
      });
    };

    // Because of how storeStore is set up it's not easy to get access to ids of
    // stores. This will get the id of a particular store based on the index it
    // was added to state in.
    this.id = index => {
      if (this.state.size <= index) {
        throw new Error(
          'Requested id for an index that is larger than the size of the ' +
            'current state.'
        );
      }
      return Array.from(this.state.keys())[index];
    };

    // This "dispatches" an action to our store. We can bypass the dispatcher
    // and just call the store's reduce function directly.
    this.dispatch = action => {
      this.state = storeStore.reduce(this.state, action);
    };
  });

  ///// Begin tests /////

  it('can add multiple stores', function() {
    expect(this.stores()).toEqual([]);

    this.dispatch({
      type: storeActionTypes.ADD_store,
      text: 'test0'
    });

    expect(this.stores()).toEqual([{ text: 'test0', complete: false }]);

    this.dispatch({
      type: storeActionTypes.ADD_store,
      text: 'test1'
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: false },
      { text: 'test1', complete: false }
    ]);
  });

  it('only removes completed stores', function() {
    this.addstores([
      { text: 'test0', complete: false },
      { text: 'test1', complete: true },
      { text: 'test2', complete: false }
    ]);

    this.dispatch({ type: storeActionTypes.DELETE_COMPLETED_storeS });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: false },
      { text: 'test2', complete: false }
    ]);
  });

  it('can delete a specific store', function() {
    this.addstores([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true },
      { text: 'test2', complete: false }
    ]);

    this.dispatch({
      type: storeActionTypes.DELETE_store,
      id: this.id(2)
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true }
    ]);

    this.dispatch({
      type: storeActionTypes.DELETE_store,
      id: this.id(0)
    });

    expect(this.stores()).toEqual([{ text: 'test1', complete: true }]);
  });

  it('can edit a specific store', function() {
    this.addstores([
      { text: 'test0', complete: false },
      { text: 'test1', complete: false },
      { text: 'test2', complete: false }
    ]);

    this.dispatch({
      type: storeActionTypes.EDIT_store,
      id: this.id(1),
      text: 'foobar'
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: false },
      { text: 'foobar', complete: false },
      { text: 'test2', complete: false }
    ]);
  });

  it('marks all stores complete if any are incomplete', function() {
    this.addstores([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true },
      { text: 'test2', complete: false }
    ]);

    this.dispatch({ type: storeActionTypes.TOGGLE_ALL_storeS });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true },
      { text: 'test2', complete: true }
    ]);
  });

  it('marks all stores incomplete if all are complete', function() {
    this.addstores([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true },
      { text: 'test2', complete: true }
    ]);

    this.dispatch({ type: storeActionTypes.TOGGLE_ALL_storeS });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: false },
      { text: 'test1', complete: false },
      { text: 'test2', complete: false }
    ]);
  });

  it('toggles a particular store', function() {
    this.addstores([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true }
    ]);

    this.dispatch({
      type: storeActionTypes.TOGGLE_store,
      id: this.id(0)
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: false },
      { text: 'test1', complete: true }
    ]);

    this.dispatch({
      type: storeActionTypes.TOGGLE_store,
      id: this.id(0)
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: true },
      { text: 'test1', complete: true }
    ]);

    this.dispatch({
      type: storeActionTypes.TOGGLE_store,
      id: this.id(1)
    });

    expect(this.stores()).toEqual([
      { text: 'test0', complete: true },
      { text: 'test1', complete: false }
    ]);
  });
});
