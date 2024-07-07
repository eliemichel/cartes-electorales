
const DOMContentLoaded = new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

///////////////////////////////////////////////////////////
// Immutable configuration globals

const config = {
	// for quick debug iterations, hide maps (do not even load it)
	DISABLE_MAP: false,

	// MapBox access token (only allowed on specific hosts so you can use it
	// localhost but not steal it for your website)
	MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoiZWxpZW1pY2hlbCIsImEiOiJjbG56d2wydHgxN3ppMmtxb3ByMjhkdW82In0.iDZGP4LZtOPIYgr1XdqY5w'
};

///////////////////////////////////////////////////////////
// Data Sources

const dataSources = [
	{
		name: 'bureaux-de-vote',
		url: 'mapbox://eliemichel.resultats',
		layers: [
			{
				name: "contours",
				type: 'line',
				color: "#000000",
				thickness: 0.2,
				'source-layer': "resultats",
			}
		]
	}
	/*
	{
		name: 'bureaux-de-vote',
		url: 'data/contours_avec_resultats.geojson',
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Yvelines' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Seine-et-Marne' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Essonne' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], "Val-d'Oise" ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Hauts-de-Seine' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Seine-Saint-Denis' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Val-de-Marne' ],
		//filter: [ '==', [ 'get', 'nomDepartement' ], 'Paris' ],
		filter: ['any',
			[ '==', [ 'get', 'nomDepartement' ], 'Yvelines' ],
			[ '==', [ 'get', 'nomDepartement' ], 'Seine-et-Marne' ],
			[ '==', [ 'get', 'nomDepartement' ], 'Essonne' ],
			[ '==', [ 'get', 'nomDepartement' ], "Val-d'Oise" ],

			[ '==', [ 'get', 'nomDepartement' ], 'Hauts-de-Seine' ],
			[ '==', [ 'get', 'nomDepartement' ], 'Seine-Saint-Denis' ],
			[ '==', [ 'get', 'nomDepartement' ], 'Val-de-Marne' ],

			[ '==', [ 'get', 'nomDepartement' ], 'Paris' ],
		],
		layers: [
			{
				name: "interieur",
				type: 'fill',
				color: ["get", "color"],
			},
			{
				name: "contours",
				type: 'line',
				color: "#000000",
				thickness: 0.2,
			}
		]
	},
	*/
];

///////////////////////////////////////////////////////////
// Map

const $map = new Promise(resolve => {
	if (config.DISABLE_MAP) {
		// Just never resolve
		console.log("Map is disabled");
	} else {
		mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;

		const map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/eliemichel/clnzwjzoj007i01qxg4vcf4m0',
			center: [2.3522, 46.8566],
			maxBounds: [
				[-10.75, 40.8566],
				[14.0, 52.8566]
			],
			zoom: 5.5,
		});

		map.on('load', () => { resolve(map); });
	}
})
.then(map => {

	for (const source of dataSources) {
		map.addSource(source.name, {
			//type: 'geojson',
			//data: null,
			type: 'vector',
			url: source.url,
			filter: source.filter,
		});

		for (const layer of source.layers) {
			const layerId = source.name + '--' + layer.name;
			map.addLayer({
				id: layerId,
				type: layer.type,
				source: source.name,
				'source-layer': layer['source-layer'],
				paint: {
					"fill": {
						"fill-color": layer.color,
						"fill-outline-color": "#888888",
						"fill-opacity": 0.5,
					},
					"line": {
						"line-color": layer.color,
						"line-width": layer.thickness,
					},
					"circle": {
						"circle-radius": 3,
						"circle-stroke-color": '#000000',
						"circle-stroke-opacity": 0.5,
						"circle-stroke-width": 1,
						"circle-color": layer.color,
						"circle-opacity": 1.0,
					}
				}[layer.type]
			});

			if (true) {
				map.on('click', layerId, (e) => {
					const props = e.features[0].properties;
					console.log(props);
				});
			}
		}
	}

	return map;
});

/*
for (const source of dataSources) {
	if (!source.url.startsWith("http")) continue;

	const $data = fetch(source.url).then(response => response.json());

	join($map, $data, (map, data) => {
		map.getSource(source.name).setData(data);
	});
}
*/
