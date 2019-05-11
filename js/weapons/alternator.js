export default {
  name: 'Alternator',
  audio: {},
  timeToFirstShot: 0,
  recoilPattern: [
    {
      xMax: 29,
      yMax: 84,
      xMin: -1,
      yMin: 41,
      t: 0.076923077
    },
    {
      xMax: -14,
      yMax: 60,
      xMin: -31,
      yMin: 27,
      t: 0.1
    },
    {
      xMax: 36,
      yMax: 84,
      xMin: 12,
      yMin: 45,
      t: 0.1
    },
    {
      xMax: -14,
      yMax: 76,
      xMin: -37,
      yMin: 40,
      t: 0.1
    },
    {
      xMax: 38,
      yMax: 74,
      xMin: 20,
      yMin: 41,
      t: 0.1
    },
    {
      xMax: -17,
      yMax: 80,
      xMin: -32,
      yMin: 41,
      t: 0.1
    },
    {
      xMax: 39,
      yMax: 64,
      xMin: 14,
      yMin: 31,
      t: 0.1
    },
    {
      xMax: -24,
      yMax: 51,
      xMin: -58,
      yMin: 16,
      t: 0.1
    },
    {
      xMax: 33,
      yMax: 72,
      xMin: 18,
      yMin: 33,
      t: 0.1
    },
    {
      xMax: -36,
      yMax: 41,
      xMin: -66,
      yMin: 5,
      t: 0.1
    },
    {
      xMax: 47,
      yMax: 64,
      xMin: 19,
      yMin: 29,
      t: 0.1
    },
    {
      xMax: -43,
      yMax: 36,
      xMin: -62,
      yMin: -2,
      t: 0.1
    },
    {
      xMax: 30,
      yMax: 47,
      xMin: 3,
      yMin: 4,
      t: 0.1
    },
    {
      xMax: -14,
      yMax: 32,
      xMin: -39,
      yMin: 1,
      t: 0.1
    },
    {
      xMax: 42,
      yMax: 54,
      xMin: 20,
      yMin: 24,
      t: 0.1
    },
    {
      xMax: 0,
      yMax: 0,
      xMin: 0,
      yMin: 0,
      t: 0.1
    }
  ],
  magazineSize: {
    noExtension: 15,
    extensionLevelOne: 15, //18 when i get the data
    extensionLevelTwo: 15, // 21 when i get the data
    extensionLevelThree: 15 // 24 when i get the data
  },
  roundsPerMinute: 600,
  reloadTime: {
    loadedNoExtension: 1.9,
    loadedExtensionLevelOne: 1.9,
    loadedExtensionLevelTwo: 1.81,
    loadedExtensionLevelThree: 1.71,
    EmptyNoExtension: 2.23,
    emptyExtensionLevelOne: 2.23,
    emptyExtensionLevelTwo: 2.12,
    emptyExtensionLevelThree: 2.01
  }
}
