// basic feature collection with line from london to zurcich
export const line = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [1.46, 52.46],
          [9.54, 48.37]
        ]
      }
    }
  ]
};

export const lineConnect = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [9.52, 48.65],
          [9.59, 48.37],
          [9.8, 48.17],
          [9.9, 48.0],
          [11, 47.6]
        ]
      }
    }
  ]
};
// export const lineConnect2 = {
//   type: 'FeatureCollection',
//   features: [
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'LineString',
//         coordinates: [
//           [11, 47.6],
//           [12, 47.0]
//         ]
//       }
//     }
//   ]
// };
// export const lineConnect3 = {
//   type: 'FeatureCollection',
//   features: [
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'LineString',
//         coordinates: [
//           [12, 47.0],
//           [13, 45.4]
//         ]
//       }
//     }
//   ]
// };

// export const line2 = {
//   type: 'FeatureCollection',
//   features: [
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'LineString',
//         coordinates: [
//           [9.64, 48.67],
//           [1.66, 52.66]
//         ]
//       }
//     }
//   ]
// };
