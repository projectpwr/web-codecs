
import { byResolution }  from './helpers';

  test('byResolution() returns the item with the highest absolute max width and height', () => {
    const cameras = [
      {
        name: 'A',
        width: {
          max: 200
        },
        height: {
          max: 200
        },
      },
      {
        name: 'B',
        width: {
          max: 1000
        },
        height: {
          max: 1000
        },
      },
      {
        name: 'C',
        width: {
          max: 1
        },
        height: {
          max: 1
        },
      },
    ];
    
    expect(byResolution(cameras[0], cameras[2])).toEqual(cameras[0]);
    expect(cameras.reduce(byResolution)).toEqual(cameras[1]);
  });



