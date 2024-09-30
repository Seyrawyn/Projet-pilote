<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  /**
 * Represents a geographic point in a track log, including latitude, longitude, and elevation.
 *
 * @interface
 * @property {$: {lat: string, lon: string}} $ - An object holding the latitude and longitude of the track point.
 * @property {string[]} ele - An array of elevations, usually captured at this specific track point.
 */
  interface TrackPoint {
    $: {
      lat: string;
      lon: string;
    };
    ele: string[];
  }

/**
 * Represents a segment of a GPS track, containing multiple geographic points.
 *
 * @interface
 * @property {TrackPoint[]} trkpt - An array of `TrackPoint` objects, each representing a point along the segment with geographic and elevation data.
 */
  interface Segment {
    trkpt: TrackPoint[];
  }

  export let segments: Segment[];

/**
 * Defines a coordinate point with latitude, longitude, and elevation.
 *
 * @type
 * @property {number} lat - The latitude of the coordinate in decimal degrees.
 * @property {number} lon - The longitude of the coordinate in decimal degrees.
 * @property {number} ele - The elevation at this coordinate, typically measured in meters.
 */
  type Coordinate = {
    lat: number,
    lon: number,
    ele: number
  };

/**
 * Processes an array of GPS track segments and generates a comprehensive path along with starting and ending points.
 *
 * @param {Segment[]} segments - An array of `Segment` objects, each containing an array of `TrackPoint` objects.
 * @returns {{ path: Coordinate[], pointA: Coordinate, pointB: Coordinate }} - An object containing the full path as an array of `Coordinate` objects,
 *          along with `pointA` and `pointB` as the starting and ending points of the path.
 */
  function generatePath(segments: Segment[]): { path: Coordinate[], pointA: Coordinate, pointB: Coordinate } {
    const path = segments.flatMap(segment =>
      segment.trkpt.map(trackPoint => ({
        lat: parseFloat(trackPoint.$.lat),
        lon: parseFloat(trackPoint.$.lon),
        ele: parseFloat(trackPoint.ele[0]),
      })),
    );
    const pointA = path[0];
    const pointB = path[path.length - 1];
    return { path, pointA, pointB };
  }

/**
 * Calculates the centroid of a collection of geographic coordinates.
 *
 * @param {Coordinate[]} coordinates - An array of coordinates, where each coordinate includes latitude, longitude, and elevation.
 * @returns {{ lat: number, lon: number }} - The calculated centroid of the coordinates as a simple object with latitude and longitude.
 */
  function calculateCentroid(coordinates: Coordinate[]): { lat: number, lon: number } {
    const total = coordinates.reduce((acc, curr) => {
      acc.lat += curr.lat;
      acc.lon += curr.lon;
      return acc;
    }, { lat: 0, lon: 0 });

    const centroid = {
      lat: total.lat / coordinates.length,
      lon: total.lon / coordinates.length,
    };
    return centroid;
  }

  let map;
  export let id: string = 'map';

/**
 * Initializes a Leaflet map upon mounting the component, focusing on dynamically loaded GPS segments.
 *
 * @function onMount - Called after the component is mounted in the DOM, specifically designed for client-side only execution.
 */
  onMount(() => {
    if (typeof window !== 'undefined' && segments) {
      import('leaflet').then(L => {
        const { path, pointA, pointB } = generatePath(segments);
        const centroid = calculateCentroid(path);

        map = L.map(id).setView([centroid.lat, centroid.lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        if (pointA) {
          L.marker([pointA.lat, pointA.lon]).addTo(map)
            .bindPopup('<b>Point A</b><br>Début du parcours.').openPopup();
        }

        if (pointB) {
          L.marker([pointB.lat, pointB.lon]).addTo(map)
            .bindPopup('<b>Point B</b><br>Fin du parcours.').openPopup();
        }

        if (path.length > 0) {
          const polyline = L.polyline(path, {color: 'blue'}).addTo(map);
          map.fitBounds(polyline.getBounds());
        }
      });
    }
  });
</script>

<style>
    .map {
        height: 30vw;
        width: 70vw;
        max-width: 600px;
    max-height: 300px;
  }
</style>

<div class="map" id="{id}"></div>
