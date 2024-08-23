declare module 'proj4' {
    function proj4(from: string, to: string, coords: [number, number]): [number, number];
    export = proj4;
  }
  