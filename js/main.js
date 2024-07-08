import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const $DOMContentLoaded = new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

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
		id: "test-circles",
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

///////////////////////////////////////////////////////////
// Data

const $pointData =
	fetch("data/centres_avec_resultats.geojson")
	.then(response => response.json());

join($map, $pointData, (map, data) => {
	map.getSource("test").setData(data);
});

const $tree = $pointData.then(pointData => {
	return d3.quadtree()
		.x(el => el.geometry.coordinates[0])
		.y(el => el.geometry.coordinates[1])
		.addAll(pointData.features);
});

///////////////////////////////////////////////////////////
// D3Map

function getVisiblePoints(pointData, tree, bbox) {
	const visiblePoints = [];
	for (const el of pointData.features) {
		if (bbox.contains(el.geometry.coordinates)) {
			visiblePoints.push(el);
		}
	}
	return visiblePoints;
}

function pixelFromCoordinates(map, coordinates) {
	//return map.project(coordinates);
	const bbox = map.getBounds();
	const minLng = bbox.getWest();
	const maxLng = bbox.getEast();
	const minLat = bbox.getSouth();
	const maxLat = bbox.getNorth();
	const lngFactor = (coordinates[0] - minLng) / (maxLng - minLng);
	const latFactor = (coordinates[1] - minLat) / (maxLat - minLat);

	const bounds = map.getContainer().getBoundingClientRect();
	const width = bounds.width;
	const height = bounds.height;
	return [ lngFactor * width, (1 - latFactor) * height ];
}

function buildD3Plot(map, visiblePoints, options) {
	const radii = Array.from({length: 1000}, d3.randomUniform(4, 18));

	const bounds = document.getElementById("overlay").getBoundingClientRect();
	const width = bounds.width;
	const height = bounds.height;
	const context = document.createElement("canvas").getContext('2d');
	context.canvas.width = width;
	context.canvas.height = height;

	console.log("length", visiblePoints.length);
	const nodes = visiblePoints.slice(0, options.disc.maxCount).map(el => {
		const pixel = pixelFromCoordinates(map, el.geometry.coordinates);
		return {
			targetx: pixel[0],
			targety: pixel[1],
			x: pixel[0],
			y: pixel[1],
			r: el.properties.inscrits / 100 * options.disc.scale,
			color: el.properties.color,
		};
	});

	console.log("nodes", nodes);

	const simulation = d3.forceSimulation(nodes)
		.velocityDecay(0.2)
		.force("x", d3.forceX(d => d.targetx).strength(0.002))
		.force("y", d3.forceY(d => d.targety).strength(0.002))
		.force("collide", d3.forceCollide().radius(d => d.r + 0.5).iterations(2))
		.on("tick", ticked);

	function ticked() {
		context.clearRect(0, 0, width, height);
		for (const d of nodes) {
			context.beginPath();
			context.moveTo(d.x + d.r, d.y);
			context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
			context.fillStyle = d.color;
			context.fill();
			//context.strokeStyle = "#333";
			//context.stroke();
		}
	}

	return context.canvas;
}

function updateD3Map(container, map, pointData, tree, options) {

	const visiblePoints = getVisiblePoints(pointData, tree, map.getBounds());

	container.replaceChildren(buildD3Plot(map, visiblePoints, options));

	/*
	const nodes = [{}, {}];
	const simulation = d3.forceSimulation(nodes)
		.force("x", d3.forceX())
		.force("collide", d3.forceCollide(5))
		.on("tick", () => console.log(nodes[0].x));
	*/

}

///////////////////////////////////////////////////////////
// Dom

const $dom = $DOMContentLoaded.then(() => {
	return {
		'btn-generate': document.getElementById('btn-generate'),
		'd3-container': document.getElementById('d3-container'),
		'show-map': document.getElementById('show-map'),
		'disc-scale': document.getElementById('disc-scale'),
		'disc-max-count': document.getElementById('disc-max-count'),
	}
});

$dom.then(dom => {
	dom['btn-generate'].disabled = true;
});

join($dom, $map, (dom, map) => {
	dom['show-map'].checked = true;
	dom['show-map'].addEventListener('change', e => {
		const show = dom['show-map'].checked;
		map.getContainer().style.display = show ? 'block' : 'none';
	})
});

join($dom, $map, $pointData, $tree, (dom, map, pointData, tree) => {
	const container = dom['d3-container'];
	dom['btn-generate'].disabled = false;
	dom['btn-generate'].addEventListener('click', e => {
		updateD3Map(container, map, pointData, tree, {
			disc: {
				scale: dom['disc-scale'].value,
				maxCount: dom['disc-max-count'].value,
			}
		})
	});
});
