import { Injectable } from "@angular/core";
import {monthToKeys} from "../data/data";
@Injectable()
export class GraphUtilities {
	monthToKeys = monthToKeys;

	calculateMonths(graph, data, length) {
		graph.categoryField = "month";
		let currentMonth = new Date().getMonth()+1;
		let currentYear = new Date().getFullYear();
		for(let i=0; i<length; i++) {
			if(i == 0) {
				graph.dataProvider.push({
					"id": currentMonth,
					"month": monthToKeys[currentMonth] + "/" + new Date().getFullYear()
				});
			} else {
				graph.dataProvider.push({
					"id": monthToKeys[(currentMonth-1) < 1 ? (12+currentMonth) : currentMonth],
					"month": monthToKeys[(currentMonth-1) < 1 ? (12+currentMonth) : currentMonth] + "/" + ((currentMonth-1) < 1 ? currentYear-1 : currentYear)
				});
			}
		}

		for(let i=0; i<data.length; i++) {
			for(let j=0; j<graph.dataProvider.length; j++) {
				if(graph.dataProvider[j].id == (new Date(data[i].fromDate).getMonth()+1)) {
					for(let key in data[i]) {
						if(["fromDate", "toDate"].indexOf(key) == -1) {
							if(!graph.dataProvider[j][key]) graph.dataProvider[j][key] = 0;
							graph.dataProvider[j][key] += data[i][key];
						}
					}
					break;
				}
			}
		}

		for(let key in graph.dataProvider[0]) {
			if(["month", "id"].indexOf(key) == -1) {
				graph.graphs.push({
					"balloonText": key + ": [[value]]",
					"fillAlphas": 0.8,
					"lineAlpha": 0.2,
					"title": key,
					"type": "column",
					"valueField": key
				});
			}
		}

		return graph;
	}

	getAppOrAssoVsHoursGraph(data, filter?) {
		let graph = {
	      	"type": "serial",
		    "theme": "light",
			"categoryField": "",
			"depth3D": 20,
			"angle": 30,
			"startDuration": 1,
			"categoryAxis": {
				"gridPosition": "start",
				"position": "left",
				"axisAlpha": 0,
				"gridAlpha": 0
			},
			"trendLines": [],
			"graphs": [],
			"guides": [],
			"valueAxes": [
				{
					"position": "top",
					"axisAlpha": 0
				}
			],
			"allLabels": [],
			"balloon": {},
			"titles": [],
			"dataProvider": []
	    };

	    //Data {from, to, [appname]: totalHoursWorked}
		if(!filter || filter == 1) {
			graph.categoryField = "week";
			for(let i=0; i<data.length; i++) {
				if(data[i].fromDate > (new Date().getTime() - (22 * 24 * 60 * 60 * 60 * 1000))) {
					let fromDate = new Date(data[i].fromDate);
					let toDate = new Date(data[i].toDate);
					let tmp = {
						"week": ((fromDate.getDate() + "/" + monthToKeys[fromDate.getMonth()+1] + "/" + fromDate.getFullYear()) + " - " + (toDate.getDate() + "/" + monthToKeys[toDate.getMonth()+1] + "/" + toDate.getFullYear()))	
					}
					for(let key in data[i]) {
						if(["fromDate", "toDate"].indexOf(key) == -1) {
							tmp[key] = data[i].key;
							graph.graphs.push({
								"balloonText": key + ": [[value]]",
								"fillAlphas": 0.8,
								"lineAlpha": 0.2,
								"title": key,
								"type": "column",
								"valueField": key
							});
						}
					}
					graph.dataProvider.push(tmp);
				}
			}
		} else if(filter < 12) {
			graph = this.calculateMonths(graph, data, filter);
		} else if(filter > 12) {
			graph.categoryField = "year";
			let yearsData = {};
			for(let i=0; i<data.length; i++) {
				let year = new Date(data[i].fromDate).getFullYear();
				if(!yearsData[year]) yearsData[year] = {};
				for(let key in data[i]) {
					if(["fromDate", "toDate"].indexOf(key) == -1) {
						if(!yearsData[year][key]) yearsData[year][key] = 0;
						yearsData[year][key] += data[i][key];
					}
				}
			}

			let flag = 0;
			for(let key in yearsData) {
				let tmp = {
					"year": key
				};
				for(let key2 in yearsData[key]) {
					tmp[key2] = yearsData[key][key2];
					if(flag == 0) {
						flag = 1;
						graph.graphs.push({
							"balloonText": key2 + ": [[value]]",
							"fillAlphas": 0.8,
							"lineAlpha": 0.2,
							"title": key2,
							"type": "column",
							"valueField": key2
						});
					}
				}

				graph.dataProvider.push(tmp);
			}
		}

		return graph;
	}
}