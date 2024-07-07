
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

const COLOR_STYLE = [
	"let",
	"M", ["max",
		["get", "bulletins_extreme_gauche"],
		["get", "bulletins_gauche"],
		["get", "bulletins_centre"],
		["get", "bulletins_droite"],
		["get", "bulletins_extreme_droite"],
		["get", "bulletins_autre"],
		["get", "bulletins_blancs"],
		["get", "bulletins_nuls"],
		["-", ["get", "inscrits"], ["get", "votants"]]
	],
	["case",
		["!=", ["var", "M"], ["var", "M"]], ["rgba", 0, 255, 0, 1.0],
		["==", ["var", "M"], ["get", "bulletins_autre"]], ["rgba", 89, 34, 17, 1.0],
		["==", ["var", "M"], ["get", "bulletins_extreme_gauche"]], ["rgba", 197, 0, 0, 1.0],
		["==", ["var", "M"], ["get", "bulletins_gauche"]], ["rgba", 246, 46, 102, 1.0],
		["==", ["var", "M"], ["get", "bulletins_centre"]], ["rgba", 251, 175, 5, 1.0],
		["==", ["var", "M"], ["get", "bulletins_droite"]], ["rgba", 6, 68, 223, 1.0],
		["==", ["var", "M"], ["get", "bulletins_extreme_droite"]], ["rgba", 36, 6, 136, 1.0],
		["==", ["var", "M"], ["get", "bulletins_blancs"]], ["rgba", 255, 255, 255, 1.0],
		["==", ["var", "M"], ["get", "bulletins_nuls"]], ["rgba", 0, 0, 0, 1.0],
		["==", ["var", "M"], ["-", ["get", "inscrits"], ["get", "votants"]]], ["rgba", 122, 122, 122, 1.0],
		["rgba", 0, 0, 0, 1.0]
	]
];

const dataSources = [
	/*
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
			//style: 'mapbox://styles/eliemichel/clybfz08a00ja01pf7w8ceaft',
			style: 'mapbox://styles/eliemichel/clnzwjzoj007i01qxg4vcf4m0',
			/*
			center: [2.3522, 46.8566],
			maxBounds: [
				[-10.75, 40.8566],
				[14.0, 52.8566]
			],
			*/
		});

		map.on('load', () => { resolve(map); });
	}
})
.then(map => {

	map.addSource("test", {
		type: 'geojson',
		data: null,
		//filter: [ "==", ["get", "nomDepartement"], "Alpes-Maritimes" ]
	});

	map.addLayer({
		id: "test-line",
		source: "test",
		type: "circle",
		paint: {
			"circle-radius": ["/", ["get", "inscrits"], 300],
			"circle-stroke-color": '#000000',
			"circle-stroke-opacity": 0.5,
			"circle-stroke-width": 1,
			"circle-color": COLOR_STYLE,
			"circle-opacity": 1.0,
		},
	});

	fetch("data/centres_avec_resultats.geojson")
	.then(response => response.json())
	.then(data => {
		console.log(data)
		map.getSource("test").setData(data);
	});

	// --------------------------------------

	map.addSource("selected-area", {
		type: 'geojson',
		data: null,
	});

	map.addLayer({
		id: "selected-area-line",
		source: "selected-area",
		type: "line",
		paint: {
			"line-color": "#ffffff",
			"line-width": 3,
		},
	});

	map.on('click', (event) => {
		// If the user clicked on one of your markers, get its information.
		const features = map.queryRenderedFeatures(event.point, {
			layers: ['resultats'] // replace with your layer name
		});

		if (!features.length) {
			return;
		}

		const feature = features[0];
		console.log(feature.properties);
		console.log(feature);

		const center = [ 0, 0 ];
		const contour = [];
		function accumulate(data) {
			for (const pt of data) {
				if (pt.length == 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number') {
					contour.push(pt);
					center[0] += pt[0];
					center[1] += pt[1];
				} else {
					accumulate(pt);
				}
			}
		};
		accumulate(feature.geometry.coordinates);
		center[0] /= contour.length;
		center[1] /= contour.length;

		const entries = [
			{ class: "abstention", label: "Abstention" },
			{ class: "extreme-gauche", label: "Extrême gauche" },
			{ class: "gauche", label: "Gauche" },
			{ class: "centre", label: "Centre" },
			{ class: "droite", label: "Droite" },
			{ class: "extreme-droite", label: "Extrême droite" },
			{ class: "autre", label: "Autre" },
			{ class: "blancs", label: "Blanc" },
			{ class: "nuls", label: "Nul" },
		];

		const inscrits = feature.properties.inscrits;
		const votants = feature.properties.votants;

		let htmlContent = '<div class="popup"><h3>Info</h3><ul>';
		for (const e of entries) {
			const key = "bulletins_" + e.class.replace("-", "_");
			const bulletins = e.class == "abstention" ? inscrits - votants : feature.properties[key];
			const ratio_votants = (100 * bulletins / votants).toFixed(1);
			const ratio_inscrits = (100 * bulletins / inscrits).toFixed(1);
			htmlContent += `<li><span class="bullet ${e.class}"></span> <strong>${e.label} : </strong> ${bulletins} (${ratio_votants}% des votants, ${ratio_inscrits}% des inscrits)</li>`;
		}
		htmlContent += "</ul></div>";

		// Code from the next step will go here.
		const popup = new mapboxgl.Popup({ offset: [0, -15] })
			.setLngLat(center)
			.setHTML(htmlContent)
			.addTo(map);

		map.getSource("selected-area").setData({
			type: "FeatureCollection",
			features: [
				{
	                type: "Feature",
	                geometry: {
	                	type: "Polygon",
	                	coordinates: [ contour ],
	                },
	                properties: {},
	            }
			]
		});
	});

	return map;
});
