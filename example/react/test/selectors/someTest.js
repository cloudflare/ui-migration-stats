/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

import AppContainer from '../../../flux-storemvc/src/containers/AppContainer';
import Counter from '../../../flux-storemvc/src/data/Counter';
import Immutable from 'immutable';
import React from 'react';
import store from '../../../flux-storemvc/src/data/store';
import storeDraftStore from '../../../flux-storemvc/src/data/storeDraftStore';
import storeEditStore from '../../../flux-storemvc/src/data/storeEditStore';
import storeStore from '../../../flux-storemvc/src/data/storeStore';

import renderer from 'react-test-renderer';

describe('AppContainer', function() {
  // Set up functions to help mock the data in each store that is used by
  // our container. If there are child containers you may also need to mock that
  // data as well. We do not need to mock all of the callbacks because we are
  // just testing how it renders at a particular point in time. If you also
  // wanted to test how the callbacks behave you would need to make these helper
  // functions actually inject their data into the stores rather than
  // overridding each store's getState() function. As your application grows
  // you should move these into test utils that can be reused across tests for
  // many containers. This should prevent the need for any code to be in the
  // beforeEach() function of your container tests.
  beforeEach(function() {
    let editStore = '';
    this.setEditID = id => editStore = id;

    let draftStore = '';
    this.setDraftText = text => draftStore = text;

    let storeStore = Immutable.OrderedMap();
    this.setstores = stores => {
      stores.forEach(store => {
        const id = Counter.increment();
        storeStore = storeStore.set(
          id,
          new store({ id, text: store.text, complete: !!store.complete })
        );
      });
    };

    // Because of how storeStore is set up it's not easy to get access to ids of
    // stores. This will get the id of a particular store based on the index it
    // was added to state in.
    this.id = index => {
      if (storeStore.size <= index) {
        throw new Error(
          'Requested id for an index that is larger than the size of the ' +
            'current state.'
        );
      }
      return Array.from(storeStore.keys())[index];
    };

    // Override all the get state's to read from our fake data.
    storeDraftStore.getState = () => draftStore;
    storeEditStore.getState = () => editStore;
    storeStore.getState = () => storeStore;

    // Simple helper so tests read easier.
    this.render = () => renderer.create(<AppContainer />).toJSON();
  });

  ///// Begin tests /////

  it('renders some stores', function() {
    this.setstores([
      { text: 'Hello', complete: false },
      { text: 'World!', complete: false }
      // Uncomment this to see what it looks like when a snapshot doesn't match.
      // {text: 'Some changes', complete: false},
    ]);

    expect(this.render()).toMatchSnapshot();
  });

  it('renders with no stores', function() {
    expect(this.render()).toMatchSnapshot();
  });

  it('renders stores that are complete', function() {
    this.setstores([
      // Try changing complete to "true" for test0 to see how snapshot changes.
      { text: 'test0', complete: false },
      { text: 'test1', complete: true },
      { text: 'test2', complete: true },
      { text: 'test3', complete: false }
    ]);

    expect(this.render()).toMatchSnapshot();
  });

  it('can edit task that is not complete', function() {
    this.setstores([
      { text: 'test0', complete: false },
      { text: 'test1', complete: true },
      { text: 'test2', complete: true },
      { text: 'test3', complete: false }
    ]);

    this.setEditID(this.id(0));

    expect(this.render()).toMatchSnapshot();
  });

  it('can edit task that is complete', function() {
    this.setstores([
      { text: 'test0', complete: false },
      { text: 'test1', complete: true },
      { text: 'test2', complete: true },
      { text: 'test3', complete: false }
    ]);

    this.setEditID(this.id(1));

    expect(this.render()).toMatchSnapshot();
  });

  it('renders draft with stores', function() {
    this.setstores([{ text: 'test0', complete: false }]);

    this.setDraftText('test1');

    expect(this.render()).toMatchSnapshot();
  });

  it('renders draft with no stores', function() {
    this.setDraftText('test0');

    expect(this.render()).toMatchSnapshot();
  });

  it('renders draft with stores while editing', function() {
    this.setstores([
      { text: 'test0', complete: false },
      { text: 'test1', complete: false }
    ]);

    this.setEditID(this.id(1));

    this.setDraftText('test1 edit');

    expect(this.render()).toMatchSnapshot();
  });
});
