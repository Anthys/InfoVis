function retrieveInfoData(countryData) {
  var data = loadedData.filter((d) => {
    return d.year == currentYear;
  });
  data = data.filter(d => {
    return d.country == countryData;
  });
  data = data.map(d => {
    return {"pop": nFormatter(d["population"],3),
  "gdp": nFormatter(d["gdp"], 3),
  "co2Cons": d["consumption_co2_per_capita"],
  "co2Prod": d["co2_per_capita"]
}
  })[0];
  return data
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

let currentMax = 27;

function getDataOfMainAttributeForMap(data) {
  const regionsModeEnabled = document.querySelector(".regions_mode").checked;
  const type = document.querySelector('input[name="co2_types"]:checked').value;
  let o1 = data.filter(d=>d["country"]=="China")[0]
  let o2 = data.filter(d=>d["country"]=="Saudi Arabia")[0]
  let o3 = data.filter(d=>d["country"]=="United States")[0]
  let o4 = data.filter(d=>d["country"]=="Australia")[0]
  if (o1 && o2 && o3 && o4){
    currentMax = Math.max(o1[type], Math.max(o2[type], Math.max(o3[type], o4[type])))
    console.log(currentMax)
  }
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
      gdp: +d.gdp,
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

function coolFormat(countryData, currentYear){
  return countryData + "." + currentYear;
}

function updatePies(){
  for (let i = 0;i<2;i++){
    updatePie(i)
  }
}

function updatePie(idx){
  if (pieIds[idx] == ""){return;}
  let sp = pieIds[idx].split(".");
  addPie2(sp[0], idx);
}

function addPie2(countryData, currentIdx){
  let identificator = coolFormat(countryData, currentYear)

  pieIds[currentIdx] = identificator;
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
  let b = document.createElement("button");
  b.setAttribute("id", "close-button");
  child.appendChild(b);
  child
    .querySelector("#close-button")
    .addEventListener("click", function () {
      pieIds[currentIdx] = "";
      let ch = document.getElementById("pieGrid").children[currentIdx];
      ch.removeChild(ch.children[0]);
      ch.removeChild(ch.children[0]);
    });
}

function addPie(countryData) {
  let identificator = coolFormat(countryData, currentYear)
  if (pieIds.includes(identificator)) {
    return;
  }
  let currentIdx = getEmptyPieId();
  addPie2(countryData, currentIdx)



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
      maxValue: currentMax,
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
      data = retrieveInfoData(countryData);

      // show the info window and set the content
      document.getElementById("info-window").style.display = "block";
      document.getElementById("info-country").innerHTML = countryData;
      document.getElementById("info-co2-emissions").innerHTML =
        data["co2Prod"];
      document.getElementById("info-population").innerHTML =
        data["pop"];
      document.getElementById("info-gdp").innerHTML = data["gdp"];
      document.getElementById(
        "info-co2-emissions-consumption"
      ).innerHTML = data["co2Cons"];
      // retrieveCo2Data(countryData, function (co2Data) {
      //   // retrieve the population data
      //   retrievePopulationData(countryData, function (populationData) {
      //     // retrieve the GDP data
      //     retrieveGdpData(countryData, function (gdpData) {
      //       // show the info window and set the content
      //       document.getElementById("info-window").style.display = "block";
      //       document.getElementById("info-country").innerHTML = countryData;
      //       document.getElementById("info-co2-emissions").innerHTML =
      //         co2EmissionsData;
      //       document.getElementById("info-population").innerHTML =
      //         populationData;
      //       document.getElementById("info-gdp").innerHTML = gdpData;
      //       document.getElementById(
      //         "info-co2-emissions-consumption"
      //       ).innerHTML = co2Data;
      //     });
      //   });
      // });
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
    updatePies();
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

//From https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}
