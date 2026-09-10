'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { CollabServer } = require('../src/server/collab_server.js');

test('CollabServer creates tenant-isolated rooms', () => {
  const server = new CollabServer();
  const room1 = server.getOrCreateRoom('scene-1', 'tenant-alpha');
  const room2 = server.getOrCreateRoom('scene-1', 'tenant-beta');

  assert.notEqual(room1, room2);
  assert.equal(room1.tenantId, 'tenant-alpha');
  assert.equal(room2.tenantId, 'tenant-beta');
});

test('CollabRoom manages editor peer presence and cursors', () => {
  const server = new CollabServer();
  const room = server.getOrCreateRoom('scene-10', 'default');

  const peer1 = room.join('user-1', { name: 'Editor Alice' });
  const peer2 = room.join('user-2', { name: 'Editor Bob' });

  assert.equal(room.peers.size, 2);
  assert.equal(peer1.name, 'Editor Alice');

  room.updateCursor('user-1', { x: 120, y: 340, sceneIndex: 2 });
  assert.equal(peer1.cursor.x, 120);

  room.applyTimelineUpdate('layer-text-1', { text: 'New Headline' }, 'user-1');
  const snap = room.getSnapshot();

  assert.equal(snap.peerCount, 2);
  assert.equal(snap.state['layer-text-1'].value.text, 'New Headline');

  room.leave('user-2');
  assert.equal(room.peers.size, 1);
});
