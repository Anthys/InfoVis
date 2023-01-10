// external loading, aka not for maps data
function retrievePopulationData(country, callback) {
  d3.tsv("/course_files/data/owid-co2-data.tsv")
    .row((d) => ({
      country: d["#country"],
      iso3: d.iso_code,
      co2: +d.co2,
      trade_co2: +d.trade_co2,
      co2_per_capita: +d.co2_per_capita,
      year: +d.year,
      population: +d.population,
      gdp: +d.gdp,
    }))
    .get(function (data) {
      data = data.filter((d) => {
        return d.year == 2019 && d.country == country;
      });
      if (data.length > 0) {
        var populationData = data[0].population;
        callback(populationData);
      }
    });
}

function retrieveGdpData(country, callback) {
  d3.tsv("/course_files/data/owid-co2-data.tsv")
    .row((d) => ({
      country: d["#country"],
      iso3: d.iso_code,
      co2: +d.co2,
      trade_co2: +d.trade_co2,
      co2_per_capita: +d.co2_per_capita,
      year: +d.year,
      population: +d.population,
      gdp: +d.gdp,
    }))
    .get(function (data) {
      data = data.filter((d) => {
        return d.year == 2018 && d.country == country;
      });
      if (data.length > 0) {
        var gdpData = data[0].gdp; // parse the GDP data as a number
        callback(gdpData);
      }
    });
}

function retrieveCo2Data(country, callback) {
  d3.tsv("/course_files/data/owid-co2-data.tsv")
    .row((d) => ({
      country: d["#country"],
      iso3: d.iso_code,
      co2: +d.co2,
      trade_co2: +d.trade_co2,
      co2_per_capita: +d.co2_per_capita,
      year: +d.year,
      population: +d.population,
      gdp: +d.gdp,
      consumption_co2_per_capita: +d.consumption_co2_per_capita,
    }))
    .get(function (data) {
      data = data.filter((d) => {
        return d.year == 2019 && d.country == country;
      });
      if (data.length > 0) {
        var co2Data = data[0].consumption_co2_per_capita; // parse the GDP data as a number
        callback(co2Data);
      }
    });
}

let parseDate = d3.timeParse("%Y");

var margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = 850,
  height = 800 - margin.top - margin.bottom;

var svg = d3.select("#container-left").append("svg");

var plot = svg
  .attr("width", "95%")
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(10,${margin.top})`);

var t = d3.scaleTime().range([0, width]);

let loadedData,
  years,
  currentYear = new Date("2018");

google.charts.load("current", {
  packages: ["geochart", 'corechart'],
});
google.charts.setOnLoadCallback(loadData);

function getDataOfMainAttributeForMap(data) {
  const regionsModeEnabled = document.querySelector(".regions_mode").checked;
  const type = document.querySelector('input[name="co2_types"]:checked').value;
  switch (type) {
    case "co2":
      data = data.map((d) => [d.country, d.co2]);
      data = [["Country", "co2Emission (million tonnes)"]].concat(data);
      break;
    case "co2_per_gdp":
      data = data.map((d) => [d.country, d.co2_per_gdp]);
      data = [["Country", "co2Emission/gdp (kg/dollar of GDP)"]].concat(data);
      break;
    case "co2_per_capita":
      data = data.map((d) => [d.country, d.co2_per_capita]);
      data = [["Country", "co2Emission/capita (tonnes/person)"]].concat(data);
      break;
    case "consumption_co2":
      data = data.map((d) => [d.country, d.consumption_co2]);
      data = [["Country", "co2Emission (million tonnes)"]].concat(data);
      break;
    case "consumption_co2_per_capita":
      data = data.map((d) => [d.country, d.consumption_co2_per_capita]);
      data = [["Country", "co2Emission/capita (tonnes/person)"]].concat(data);
      break;
    case "consumption_co2_per_gdp":
      data = data.map((d) => [d.country, d.consumption_co2_per_gdp]);
      data = [["Country", "co2Emission/capita (kg/dollar of GDP)"]].concat(
        data
      );
      break;
    default: // trade co2
      data = data.map((d) => [d.country, d.trade_co2]);
      data = [["Country", "trade co2Emission (million tonnes)"]].concat(data);
  }
  return data;
}

// default, first load
function loadData() {
  d3.tsv("/course_files/data/owid-co2-data.tsv")
    .row((d) => ({
      country: d["#country"],
      iso3: d.iso_code,
      co2: +d.co2,
      trade_co2: +d.trade_co2,
      co2_per_capita: +d.co2_per_capita,
      co2_per_gdp: +d.co2_per_gdp,
      year: +d.year,
      population: +d.population,
      consumption_co2: +d.consumption_co2,
      consumption_co2_per_capita: +d.consumption_co2_per_capita,
      consumption_co2_per_gdp: +d.consumption_co2_per_gdp,
      cement_co2: +d.cement_co2,
      coal_co2: +d.coal_co2,
      flaring_co2: +d.flaring_co2,
      oil_co2: +d.oil_co2,
      other_industry_co2: +d.other_industry_co2
    }))
    .get(function (data) {
      // data
      loadedData = data;
      years = [...new Set(data.map((d) => d.year))]
        .map((d) => new Date(`${d}`))
        .sort((a, b) => a - b);

      t.domain([d3.min(years), d3.max(years)]);

      const [t0, t1] = t.domain();
      data = data.filter((d) => {
        return d.year == currentYear;
      });
      data = getDataOfMainAttributeForMap(data);

      // draw map
      drawRegionsMap(data);

      // draw year slider
      drawYearSlider(years);
    });
}

// Data filtering by observation year
function filterData(year) {
  currentYear = year;
  let data = loadedData.filter((d) => {
    return d.year == year;
  });
  data = getDataOfMainAttributeForMap(data);

  // draw map
  drawRegionsMap(data);
}

// Map drawing -------------------------------------
function getMinMaxValueForMap() {
  const type = document.querySelector('input[name="co2_types"]:checked').value;
  switch (type) {
    case "co2":
      if (currentYear >= 2010) return [0, 8000];
      else return [0, 4000];
    case "co2_per_gdp":
      return [0, 1.25];
    case "co2_per_capita":
      return [0, 27];
    case "consumption_co2":
      if (currentYear >= 2010) return [0, 8000];
      else return [0, 4000];
    case "consumption_co2_per_capita":
      return [0, 27];
    case "consumption_co2_per_gdp":
      return [0, 1];
    default: // trade co2
      return [-500, 500];
  }
}

function getColorValueForMap() {
  const type = document.querySelector('input[name="co2_types"]:checked').value;
  switch (type) {
    case "co2":
    case "co2_per_gdp":
    case "co2_per_capita":
      return ["green"];
    case "consumption_co2":
    case "consumption_co2_per_capita":
    case "consumption_co2_per_gdp":
      return ["blue"];
    default: // trade
      return ["red", "grey", "blue"];
  }
}

// function drawRegionsMap() {

//   d3.tsv("/course_files/data/owid-co2-data.tsv")
//     .row(
//       d => ({
//         country: d['#country'],
//         iso3: d.iso_code,
//         co2: +d.co2,
//         trade_co2: +d.trade_co2,
//         co2_per_capita: +d.co2_per_capita,
//         year: +d.year,
//         population: +d.population,
//         gdp: +d.gdp,
//       }))
//     .get(function (data) {
//       data = data.filter(d => { return (d.year == 2019); });
//       console.log(data);
//       // data = data.map(d=>([d.country, 1_000_000*d.co2/d.population]));
//       // data = data.map(d=>([d.country, d.co2_per_capita]));
//       data = data.map(d => ([d.country, d.co2_per_capita]));

//       // data = [["Country", "co2Emission/capita (ton/hab)"]].concat(data);
//       data = [["Country", "co2Emission/capita (ton/hab)"]].concat(data);
//       data = google.visualization.arrayToDataTable(data);

//       var options = {
//         colorAxis: { minValue: 0, maxValue: 27 }
//       };

//       var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

//       chart.draw(data, options);

//       google.visualization.events.addListener(chart, 'select', function () {
//         var selection = chart.getSelection();
//         // check if a selection was made
//         if (selection.length > 0) {
//           // get the selected row
//           var row = selection[0].row;
//           // get the data for the selected row
//           var countryData = data.getValue(row, 0);
//           addPie(countryData);
//           var co2EmissionsData = data.getValue(row, 1);
//           // retrieve consumption based data
//           retrieveCo2Data(countryData, function (co2Data) {
//             // retrieve the population data
//             retrievePopulationData(countryData, function (populationData) {
//               // retrieve the GDP data
//               retrieveGdpData(countryData, function (gdpData) {
//                 // show the info window and set the content
//                 document.getElementById("info-window").style.display = "block";
//                 document.getElementById("info-country").innerHTML = countryData;
//                 document.getElementById("info-co2-emissions").innerHTML = co2EmissionsData;
//                 document.getElementById("info-population").innerHTML = populationData;
//                 document.getElementById("info-gdp").innerHTML = gdpData;
//                 document.getElementById("info-co2-emissions-consumption").innerHTML = co2Data;
//               });
//             });
//           });
//         }

//       });

//     });
// }

document
  .querySelector("#info-window #close-button")
  .addEventListener("click", function () {
    document.getElementById("info-window").style.display = "none";
  });

pieIds = ["", ""];

function getEmptyPieId() {
  for (let i = 0; i < 1; i++) {
    if (pieIds[i] == "") {
      return i;
    }
  }
  return 1;
}

function addPie(countryData) {
  if (pieIds.includes(countryData)) {
    return;
  }
  let currentIdx = getEmptyPieId();
  pieIds[currentIdx] = countryData;
  console.log(pieIds);
  let child = document.getElementById("pieGrid").children[currentIdx];

  var data = loadedData.filter((d) => {
    return d.year == currentYear;
  });
  data = data.filter(d => {
    return d.country == countryData;
  });
  let header = ["Domain", "Co2"];
  data = data.map(d => {
    return [
      ["Cement", d["cement_co2"]],
      ["Coal", d["coal_co2"]],
      ["Flaring", d["flaring_co2"]],
      ["Oil", d["oil_co2"]],
      ["Other industry", d["other_industry_co2"]]
    ];
  })[0];
  var out = [header];
  out = out.concat(data);

  var data = google.visualization.arrayToDataTable(out);

  var options = {
    title: 'Piechart for ' + countryData,
    legend: 'none'
  };

  var chart = new google.visualization.PieChart(child);

  chart.draw(data, options);



  //   let newChild = document.getElementById("pieTemplate").cloneNode(true);
  //   newChild.setAttribute("id", "pie" + countryData);
  //   newChild.querySelector("p").innerHTML = countryData + " piechart placeholder";
  //   let b = document.createElement("button");
  //   b.setAttribute("id", "close-button");
  //   newChild.appendChild(b);
  //   newChild
  //     .querySelector("#close-button")
  //     .addEventListener("click", function () {
  //       pieIds[currentIdx] = "";
  //       let n = document.getElementById("pieTemplate").cloneNode(true);
  //       n.style.display = "inline";
  //       document.getElementById("pieGrid").replaceChild(n, newChild);
  //     });
  //   newChild.style.display = "inline";
  //   document.getElementById("pieGrid").replaceChild(newChild, child);
}
function drawRegionsMap(data) {
  let chartData = google.visualization.arrayToDataTable(data);
  const min_max = getMinMaxValueForMap();
  var options = {
    colorAxis: {
      minValue: min_max[0],
      maxValue: min_max[1],
      colors: getColorValueForMap(),
    },
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById("regions_div")
  );

  chart.draw(chartData, options);
  google.visualization.events.addListener(chart, "select", function () {
    var selection = chart.getSelection();
    // check if a selection was made
    if (selection.length > 0) {
      // get the selected row
      var row = selection[0].row;
      // get the data for the selected row
      var countryData = chartData.getValue(row, 0);
      addPie(countryData);
      var co2EmissionsData = chartData.getValue(row, 1);
      // retrieve consumption based data
      retrieveCo2Data(countryData, function (co2Data) {
        // retrieve the population data
        retrievePopulationData(countryData, function (populationData) {
          // retrieve the GDP data
          retrieveGdpData(countryData, function (gdpData) {
            // show the info window and set the content
            document.getElementById("info-window").style.display = "block";
            document.getElementById("info-country").innerHTML = countryData;
            document.getElementById("info-co2-emissions").innerHTML =
              co2EmissionsData;
            document.getElementById("info-population").innerHTML =
              populationData;
            document.getElementById("info-gdp").innerHTML = gdpData;
            document.getElementById(
              "info-co2-emissions-consumption"
            ).innerHTML = co2Data;
          });
        });
      });
    }
  });
}

// Years' slider -------------------------------------
function drawYearSlider(years) {
  // year slider
  var t_slider = plot.append("g");
  t_slider.call(d3.axisBottom().scale(t).tickFormat(d3.timeFormat("%Y")));
  function clickable(elem) {
    return elem
      .on("mouseover", (e) => elem.style("cursor", "pointer"))
      .on("mouseout", (e) => elem.style("cursor", "default"));
  }

  const t_thumb = clickable(t_slider.append("g"));

  t_thumb.append("line").attr("stroke", "black").attr("y2", "-10");
  t_thumb
    .append("circle")
    .attr("stroke", "black")
    .attr("fill", "lightgray")
    .attr("r", "5");
  t_thumb
    .append("rect")
    .attr("fill", "white")
    .attr("fill-opacity", ".75")
    .attr("x", "-13")
    .attr("width", "26")
    .attr("y", "-22")
    .attr("height", "12");
  t_thumb
    .append("text")
    .attr("fill", "black")
    .attr("y", "-12")
    .attr("text-anchor", "middle")
    .text("…");
  var t_x = 0;
  t_thumb.call(
    d3
      .drag()
      .on("start", () => {
        t_x = d3.event.x;
      })
      .on("drag", () => {
        t_x += d3.event.dx;
        if (t_x < margin.left) {
          t_x = 0;
        } else if (t_x > width) {
          t_x = width;
        }
        year = t.invert(t_x);
        updateYear(year);
      })
  );

  function updateYear(year) {
    // on slider
    t_thumb.attr("transform", `translate(${t(year)})`);
    year = year.getFullYear();
    t_thumb.select("text").text(year);

    // update data on map
    filterData(year);
  }
  updateYear(currentYear);
}

// Radio input for co2 types ------------------------------
var radios = document.querySelectorAll('input[type=radio][name="co2_types"]');
radios.forEach((radio) =>
  radio.addEventListener("change", () => {
    // trigger change of main attribute
    filterData(currentYear);
  })
);
