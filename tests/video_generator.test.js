'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { VideoGenerator } = require('../src/services/video_generator.js');

test('VideoGenerator compiles multi-scene video prompts', () => {
  const generator = new VideoGenerator();
  const scenes = generator.compileScenePrompts('Wireless Ergonomic Mouse', [
    { visualFocus: 'RGB lighting showcase', durationSeconds: 3 },
    { visualFocus: 'Grip comfort in hand', durationSeconds: 4 },
  ]);

  assert.equal(scenes.length, 2);
  assert.ok(scenes[0].prompt.includes('RGB lighting showcase'));
  assert.equal(scenes[0].aspectRatio, '9:16');
});

test('VideoGenerator calculates waveform audio timeline alignment', () => {
  const generator = new VideoGenerator();
  const scenes = [
    { sceneIndex: 0, durationSeconds: 5 },
    { sceneIndex: 1, durationSeconds: 5 },
    { sceneIndex: 2, durationSeconds: 5 },
  ];

  const timeline = generator.calculateTimelineWaveform(scenes, 15);
  assert.equal(timeline.totalDuration, 15);
  assert.equal(timeline.isAudioAligned, true);
  assert.equal(timeline.scenes[1].startTime, 5);
  assert.equal(timeline.scenes[1].endTime, 10);
});
