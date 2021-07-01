$( document ).ready(function() {
    
    var input;
    var displayYearly = false;
    var displaySeasonaly = false;
    var showAverages = true;
    var displayYear = "";
    var displaySeason = "";
    var validYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021'];
    var validSeasons = ['Winter', 'Spring', 'Summer', 'Fall'];

    // Menu drop downs
    $("#yearly-drop-down").on('click',function(){
        if(displayYearly) {
            displayYearly = false;
            displaySeasonaly = false;
            $("#yearly-drop-down-container").removeClass("show");
        } else if(displaySeasonaly) {
            displayYearly = true;
            displaySeasonaly = false;
            $("#seasonal-drop-down-container").removeClass("show");
            $("#yearly-drop-down-container").addClass("show");
        } else if(!displaySeasonaly && !displayYearly) {
            displayYearly = true;
            $("#yearly-drop-down-container").addClass("show");
        }
    });

    $("#seasonal-drop-down").on('click',function(){
        if(displaySeasonaly) {
            displayYearly = false;
            displaySeasonaly = false;
            $("#seasonal-drop-down-container").removeClass("show");
        } else if(displayYearly) {
            displayYearly = false;
            displaySeasonaly = true;
            $("#seasonal-drop-down-container").addClass("show");
            $("#yearly-drop-down-container").removeClass("show");
        } else if(!displaySeasonaly && !displayYearly) {
            displaySeasonaly = true;
            $("#seasonal-drop-down-container").addClass("show");
        }
    });

    /*
    $("#reset").on('click', function(){
        $("#seasonal-graph").removeClass("show");
        $("#yearly-graph").removeClass("show");
        $("#overall-graph").addClass("show");

        $("#yearly-drop-down-container").removeClass("show");
        $("#seasonal-drop-down-container").removeClass("show");
        displaySeasonaly = false;
        displayYearly = false;
    });
    */

    $("ul#year-list").on('click', 'li', function(e){
        var year = ($(this).text());
        if(validYears.indexOf(year) > -1) {
            // Valid year selected
            updateChart("year", year);
            $("#overall-graph").removeClass("show");
            $("#seasonal-graph").removeClass("show");
            $("#missing-graph").removeClass("show");
            $("#yearly-graph").addClass("show");
            $("#yearly-graph h4").text("Population Weighted Temperature Data for "+year);
            $("#show-averages-container").addClass("show");
            $("#yearly-drop-down-container").removeClass("show");
            $("#seasonal-drop-down-container").removeClass("show");
            displaySeasonaly = false;
            displayYearly = false;
        }
    });

    $("ul#season-list").on('click', 'li', function(e){
        var season = ($(this).text());
        if(validSeasons.indexOf(season) > -1) {
            // Valid season selected
            updateChart("season", season);
            $("#overall-graph").removeClass("show");
            $("#yearly-graph").removeClass("show");
            $("#missing-graph").removeClass("show");
            $("#seasonal-graph").addClass("show");
            $("#seasonal-graph h4").text("Population Weighted Temperature Data for "+season);
            $("#show-averages-container").addClass("show");
            $("#yearly-drop-down-container").removeClass("show");
            $("#seasonal-drop-down-container").removeClass("show");
            displaySeasonaly = false;
            displayYearly = false;
        }
    });

    $("#missing-data").on("click", function(){
        $("#overall-graph").removeClass("show");
        $("#yearly-graph").removeClass("show");
        $("#seasonal-graph").removeClass("show");
        $("#yearly-drop-down-container").removeClass("show");
        $("#seasonal-drop-down-container").removeClass("show");
        $("#show-averages-container").removeClass("show");
        displaySeasonaly = false;
        displayYearly = false;
        $("#missing-graph").addClass("show");
        $("#midding-graph h4").text("Missing Data");
        missingDataGraph();
    });

    /*
    $("#show-averages").on("click", function(){
        if(showAverages) {
            showAverages = false;
            $("#show-averages-container").removeClass('show');
            $("#show-averages").removeClass('show');
            $("#overall-graph").addClass('large');
            $("#yearly-graph").addClass('large');
            $("#seasonal-graph").addClass('large');

        } else {
            showAverages = true;
            $("#show-averages-container").addClass('show');
            $("#show-averages").addClass('show');
            $("#overall-graph").removeClass('large');
            $("#yearly-graph").removeClass('large');
            $("#seasonal-graph").removeClass('large');
        }
    });
    */

    /* Charts */
    $.ajax({
        type: "GET",  
        url: "/src/package/output/weighted_population_data.csv",
        dataType: "text",       
        success: function(response) {
            input = $.csv.toArrays(response);
            chartData(input);
        }   
    });

    function chartData(input) {
        //console.log(input);

        var meanData = getData("mean", input);
        var maxData = getData("max", input);
        var minData = getData("min", input);
        //console.log(meanData);
        //console.log(maxData);
        //console.log(minData);

        var weightedPopCanvas = document.getElementById("weighted-pop-chart");

        Chart.defaults.global.defaultFontFamily = "Lato";
        Chart.defaults.global.defaultFontSize = 14;

        var dataMean = {
            label: "Avg. Temp",
            data: meanData,
            lineTension: 0,
            fill: false,
            borderColor: '#3C948B'
        };

        var dataMax = {
            label: "Max Temp",
            data: maxData,
            lineTension: 0,
            fill: false,
            borderColor: 'orange'
        };

        var dataMin = {
            label: "Min Temp",
            data: minData,
            lineTension: 0,
            fill: false,
            borderColor: 'blue'
        };

        var weightedPopData = {
            labels: [],
            datasets: [dataMean, dataMax, dataMin]
        };

        var chartOptions = {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 80,
                    fontColor: 'black'
                }
            },
            scales: {
                xAxes: [{ticks: {callback: (value) => { return new Date(value).toLocaleDateString( {month: "short", year: "numeric"});}}}]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        //var label = data.labels[tooltipItem.index];
                        return ': (' + new Date(tooltipItem.xLabel).toLocaleDateString( {month: "short", year: "numeric"}) + ', ' + tooltipItem.yLabel + ')';
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        var scatterChart = new Chart(weightedPopCanvas, {
            type: 'scatter',
            data: weightedPopData,
            options: chartOptions
        });
    }

    function getData(type, array) {
        let result = [];
        let averages = [];
        let years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021"];
        let checkYear = 0;
        let currentYear = 0;
        let dayCount = 0;
        let yearlyMean = 0;
        let yearlyMax = 0;
        let yearlyMin = 0;
        let mean = 0;
        let max = 0;
        let min = 0;
        if(type == "mean") {
            // Columns 0+1
            for(let i=1; i<array.length; i++) {
                // skip row 0
                result.push({x: moment(array[i][0]), y: array[i][1]});
                
            }
        } else if(type == "max") {
            // Columns 0+2
            for(let i=1; i<array.length; i++) {
                // skip row 0
                result.push({x: moment(array[i][0]), y: array[i][2]});
                
            }
        } else if(type == "min") {
            // Columns 0+3
            for(let i=1; i<array.length; i++) {
                // skip row 0
                result.push({x: moment(array[i][0]), y: array[i][3]});
                
            }
        }
        // Averages
        for(let i=1; i<array.length; i++) {
            // skip row 0
            let d = array[i][0];
            checkYear = parseInt(d.substr(d.lastIndexOf("/")+1));
            if(currentYear == 0) {
                // first valid
                currentYear = checkYear
                dayCount = 0;
                yearlyMean = 0;
                yearlyMax = 0;
                yearlyMin = 100;
            }
            if(checkYear != currentYear) {
                // year changed
                // calc + record average from last year
                mean = Math.round((yearlyMean/dayCount)*100)/100;
                max = yearlyMax
                min = yearlyMin;
                averages.push([currentYear, mean, max, min]);

                // reset count + avg
                currentYear = checkYear;
                dayCount = 1;
                yearlyMean = parseFloat(array[i][1]);
                yearlyMax = parseFloat(array[i][2]);
                yearlyMin = parseFloat(array[i][3]);
            } else {
                // same year
                dayCount++;
                yearlyMean += parseFloat(array[i][1]);
                if(parseFloat(array[i][2]) > yearlyMax) {
                    yearlyMax = parseFloat(array[i][2]);
                }
                if(parseFloat(array[i][3]) < yearlyMin) {
                    yearlyMin = parseFloat(array[i][3]);
                }
            }
            if(i == (array.length-1)) {
                // Last it - record last of averages
                mean = Math.round((yearlyMean/dayCount)*100)/100;
                max = yearlyMax;
                min = yearlyMin;
                averages.push([currentYear, mean, max, min]);

                updateAverages(averages);
                return(result);
            }
        }
    }

    function getYearlyData(type, array, year) {
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let result = [];
        let averages = [];
        let checkMonth = 0;
        let currentMonth = 0;
        let dayCount = 0;
        let monthlyMean = 0;
        let monthlyMax = 0;
        let monthlyMin = 0;
        let mean = 0;
        let max = 0;
        let min = 0;
        if(type == "mean") {
            // Columns 0+1
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let check = array[i][0]+"";
                if(check.indexOf(year) > -1) {
                    result.push({x: moment(array[i][0]), y: array[i][1]});
                }
            }
        } else if(type == "max") {
            // Columns 0+2
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let check = array[i][0]+"";
                if(check.indexOf(year) > -1) {
                    result.push({x: moment(array[i][0]), y: array[i][2]});
                }
            }
        } else if(type == "min") {
            // Columns 0+3
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let check = array[i][0]+"";
                if(check.indexOf(year) > -1) {
                    result.push({x: moment(array[i][0]), y: array[i][3]});
                }
            }
        }
        // Averages
        for(let i=1; i<array.length; i++) {
            // skip row 0
            let check = array[i][0]+"";
            if(check.indexOf(year) > -1) {
                checkMonth = parseInt(check.substr(0,check.indexOf("/")));
                if(currentMonth == 0) {
                    // first valid
                    currentMonth = checkMonth
                    dayCount = 0;
                    monthlyMean = 0;
                    monthlyMax = 0;
                    monthlyMin = 100;
                }
                if(checkMonth != currentMonth) {
                    // month changed
                    // calc + record average from last month
                    mean = Math.round((monthlyMean/dayCount)*100)/100;
                    max = monthlyMax;
                    min = monthlyMin;
                    averages.push([months[(currentMonth-1)], mean, max, min]);

                    // reset count + avg
                    currentMonth = checkMonth;
                    dayCount = 1;
                    monthlyMean = parseFloat(array[i][1]);
                    monthlyMax = parseFloat(array[i][2]);
                    monthlyMin = parseFloat(array[i][3]);
                } else {
                    // same month
                    dayCount++;
                    monthlyMean += parseFloat(array[i][1]);
                    if(parseFloat(array[i][2]) > monthlyMax) {
                        monthlyMax = parseFloat(array[i][2]);
                    }
                    if(parseFloat(array[i][3]) < monthlyMin) {
                        monthlyMin = parseFloat(array[i][3]);
                    }
                }
            }
            if(i == (array.length-1)) {
                // Last it - record last of averages
                mean = Math.round((monthlyMean/dayCount)*100)/100;
                max = monthlyMax;
                min = monthlyMin;
                averages.push([months[(currentMonth-1)], mean, max, min]);

                updateAverages(averages);
                return(result);
            }
        }
                
    }

    function getSeasonalData(type, array, season) {
        let years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021"];
        let result = [];
        let averages = [];
        let checkYear = 0;
        let currentYear = 0;
        let dayCount = 0;
        let yearlyMean = 0;
        let yearlyMax = 0;
        let yearlyMin = 0;
        let mean = 0;
        let max = 0;
        let min = 0;
        let validMonths = [];
        if(season == "Winter") {
            validMonths = [12, 1, 2];
        } else if (season == "Spring"){
            validMonths = [3, 4, 5];
        } else if (season == "Summer") {
            validMonths = [6, 7, 8];
        } else if (season == "Fall") {
            validMonths = [9, 10, 11];
        } 
        if(type == "mean") {
            // Columns 0+1
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let date = array[i][0]+"";
                let check = parseInt(date.substr(0, date.indexOf("/")));
                if(validMonths.includes(check)) {
                    result.push({x: moment(array[i][0]), y: array[i][1]});
                }
                
            }
        } else if(type == "max") {
            // Columns 0+2
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let date = array[i][0]+"";
                let check = parseInt(date.substr(0, date.indexOf("/")));
                if(validMonths.includes(check)) {
                    result.push({x: moment(array[i][0]), y: array[i][2]});
                }
                
            }
        } else if(type == "min") {
            // Columns 0+3
            for(let i=1; i<array.length; i++) {
                // skip row 0
                let date = array[i][0]+"";
                let check = parseInt(date.substr(0, date.indexOf("/")));
                if(validMonths.includes(check)) {
                    result.push({x: moment(array[i][0]), y: array[i][3]});
                }
                
            }
        }
        // Averages
        for(let i=1; i<array.length; i++) {
            // skip row 0
            let date = array[i][0]+"";
            let check = parseInt(date.substr(0, date.indexOf("/")));
            checkYear = parseInt(date.substr(date.lastIndexOf("/")+1));
            if(validMonths.includes(check)) {
                if(currentYear == 0) {
                    // first valid
                    currentYear = checkYear
                    dayCount = 0;
                    yearlyMean = 0;
                    yearlyMax = 0;
                    yearlyMin = 100;
                }
                if(checkYear != currentYear) {
                    // month changed
                    // calc + record average from last month
                    mean = Math.round((yearlyMean/dayCount)*100)/100;
                    max = yearlyMax;
                    min = yearlyMin;
                    averages.push([currentYear, mean, max, min]);

                    // reset count + avg
                    currentYear = checkYear;
                    dayCount = 1;
                    yearlyMean = parseFloat(array[i][1]);
                    yearlyMax = parseFloat(array[i][2]);
                    yearlyMin = parseFloat(array[i][3]);
                } else {
                    // same month
                    dayCount++;
                    yearlyMean += parseFloat(array[i][1]);
                    if(parseFloat(array[i][2]) > yearlyMax) {
                        yearlyMax = parseFloat(array[i][2]);
                    }
                    if(parseFloat(array[i][3]) < yearlyMin) {
                        yearlyMin = parseFloat(array[i][3]);
                    }
                }
            }
            if(i == (array.length-1)) {
                // Last it - record last of averages
                mean = Math.round((yearlyMean/dayCount)*100)/100;
                max = yearlyMax;
                min = yearlyMin;
                averages.push([currentYear, mean, max, min]);

                updateAverages(averages);
                return(result);
            }
        }
    }

    function updateChart(type, value) {
        if(type == "year") {
            $("#yearly-graph").html("");
            $("#yearly-graph").append('<h4>Annual Data</h4>');
            $("#yearly-graph").append('<canvas id="annual-pop-chart"></canvas>');
            var annualMeanData = getYearlyData("mean", input, value);
            var annualMaxData = getYearlyData("max", input, value);
            var annualMinData = getYearlyData("min", input, value);

            var annualPopCanvas = document.getElementById("annual-pop-chart");

            var annualDataMean = {
                label: "Avg. Temp",
                data: annualMeanData,
                lineTension: 0,
                fill: false,
                borderColor: '#3C948B'
            };
    
            var annualDataMax = {
                label: "Max Temp",
                data: annualMaxData,
                lineTension: 0,
                fill: false,
                borderColor: 'orange'
            };
    
            var annualDataMin = {
                label: "Min Temp",
                data: annualMinData,
                lineTension: 0,
                fill: false,
                borderColor: 'blue'
            };
    
            var annualData = {
                labels: [],
                datasets: [annualDataMean, annualDataMax, annualDataMin]
            };
    
            var chartOptions = {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black'
                    }
                },
                scales: {
                    xAxes: [{ticks: {callback: (value) => { return new Date(value).toLocaleDateString( {month: "short", year: "numeric"});}}}]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            //var label = data.labels[tooltipItem.index];
                            return ': (' + new Date(tooltipItem.xLabel).toLocaleDateString( {month: "short", year: "numeric"}) + ', ' + tooltipItem.yLabel + ')';
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            };

            var annualScatterChart = new Chart(annualPopCanvas, {
                type: 'scatter',
                data: annualData,
                options: chartOptions
            });
            annualScatterChart.destroy();
            var annualScatterChart = new Chart(annualPopCanvas, {
                type: 'scatter',
                data: annualData,
                options: chartOptions
            });
            //annualPopCanvas.destroy();

        } else if (type == "season") {
            $("#seasonal-graph").html("");
            $("#seasonal-graph").append('<h4>Seasonal Data</h4>');
            $("#seasonal-graph").append('<canvas id="seasonal-pop-chart"></canvas>');
            var seasonalMeanData = getSeasonalData("mean", input, value);
            var seasonalMaxData = getSeasonalData("max", input, value);
            var seasonalMinData = getSeasonalData("min", input, value);

            var seasonalPopCanvas = document.getElementById("seasonal-pop-chart");

            var seasonalDataMean = {
                label: "Avg. Temp",
                data: seasonalMeanData,
                lineTension: 0,
                fill: false,
                borderColor: '#3C948B'
            };
    
            var seasonalDataMax = {
                label: "Max Temp",
                data: seasonalMaxData,
                lineTension: 0,
                fill: false,
                borderColor: 'orange'
            };
    
            var seasonalDataMin = {
                label: "Min Temp",
                data: seasonalMinData,
                lineTension: 0,
                fill: false,
                borderColor: 'blue'
            };
    
            var seasonalData = {
                labels: [],
                datasets: [seasonalDataMean, seasonalDataMax, seasonalDataMin]
            };
    
            var chartOptions = {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black'
                    }
                },
                scales: {
                    xAxes: [{ticks: {callback: (value) => { return new Date(value).toLocaleDateString( {month: "short", year: "numeric"});}}}]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            //var label = data.labels[tooltipItem.index];
                            return ': (' + new Date(tooltipItem.xLabel).toLocaleDateString( {month: "short", year: "numeric"}) + ', ' + tooltipItem.yLabel + ')';
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            };
    
            var seasonalScatterChart = new Chart(seasonalPopCanvas, {
                type: 'scatter',
                data: seasonalData,
                options: chartOptions
            });
        }
    }

    function missingDataGraph() {
        var missingData;
        $.ajax({
            type: "GET",  
            url: "/src/package/output/missing_data.csv",
            dataType: "text",       
            success: function(response) {
                missingData = $.csv.toObjects(response);
                //console.log(missingData);
                //missingChartData(missingData);
                missingTableData(missingData);
            }   
        });
    }

    function missingTableData(input) {
        // Sort input array by station code
        input.sort(function(a, b) {
            var stationA = a.station.toUpperCase(); // ignore upper and lowercase
            var stationB = b.station.toUpperCase(); // ignore upper and lowercase
            if (stationA < stationB) {
                return -1;
            }
            if (stationA > stationB) {
                return 1;
            }
            // names must be equal
            return 0;
        });

        $("#missing-graph > table > tbody").html('');
        for(let i=0; i<input.length; i++) {
            $("#missing-graph > #missing-table > tbody:last-child").append(`
                    <tr>
                        <td>${input[i]['date']}</td>
                        <td>${input[i]['city']}</td>
                        <td>${input[i]['state']}</td>
                        <td>${input[i]['station']}</td>
                        <td>${input[i]['temp_mean_c']}</td>
                        <td>${input[i]['temp_max_c']}</td>
                        <td>${input[i]['temp_min_c']}</td>
                    </tr>
            `);
        }
        //$("#missing-graph").append('<canvas id="missing-pop-chart"></canvas>');
    }


    /* Update Averages */
    function updateAverages(avg) {
        avg.reverse();
        //console.log(avg);
        $("ul#averages").text("");
        for(let i=0; i<avg.length; i++) {
            $("#averages").append(`
                <li>
                    <div style=" height: 40px; overflow: hidden; vertical-align: middle;">
                        <div style="float:left; height: 40px; vertical-align: middle; margin-right: 5px;">${avg[i][0]}</div>
                        <div style="float: right; height: 40px; overflow:hidden;">
                            <div style="display:block; height: 13px; font-size: 10px;">Avg. <span style="color: #333;">${avg[i][1]}</span></div>
                            <div style="display:block; height: 13px; font-size: 10px;">Max. <span style="color: #333;">${avg[i][2]}</span></div>
                            <div style="display:block; height: 13px; font-size: 10px;">Min. <span style="color: #333;">${avg[i][3]}</span></div>
                        </div>
                    </div>
                </li>
            `);
        }
    }

});