// global variables for all datatable.
var highestRevisionsTable, lowestRevisionsTable, highestGroupTable, lowestGroupTable, longestHistoryTable,
    shortestHistoryTable;

/**
 * Initialize the page with jQuery.
 */
$(document).ready(function () {
    showAllDataTable();
    buttonToggle();
    numberOfTopArticlesChange();
});

/**
 * Show all datatable with default number.
 */
function showAllDataTable() {
    // create all datatable
    highestRevisionsTable = createDataTable($("#highestRevisionsTable"));
    lowestRevisionsTable = createDataTable($("#lowestRevisionsTable"));
    highestGroupTable = createDataTable($("#highestGroupTable"));
    lowestGroupTable = createDataTable($("#lowestGroupTable"));
    longestHistoryTable = createDataTable($("#longestHistoryTable"));
    shortestHistoryTable = createDataTable($("#shortestHistoryTable"));

    // add new rows into all datatable with default number 2.
    var defaultNumberOfTopArticles = 2;
    getHighestRevisions(defaultNumberOfTopArticles);
    getLowestRevisions(defaultNumberOfTopArticles);
    getHighestGroupTable(defaultNumberOfTopArticles);
    getLowestGroupTable(defaultNumberOfTopArticles);
    getLongestHistoryTable(defaultNumberOfTopArticles);
    getShortestHistoryTable(defaultNumberOfTopArticles);
    getUserTypeByYear();
    getUserType();
}

/**
 * Button toggle.
 */
function buttonToggle() {
    // When the user click the "Revision number distribution by year and by user type (Bar/Line chart)" button
    $("#barLineChartButton").click(function () {
        inactiveAllButtons();
        $("#barLineButtonDiv").show();
        $("#barLineChartButton").toggleClass('active');
        $("#barChartButton").toggleClass('active');
        hideAllCharts();
        $("#columnChart").show();
    });

    // When the user click the "Revision number distribution by user type (Pie chart)" button
    $("#pieChartButton").click(function () {
        inactiveAllButtons();
        $("#barLineButtonDiv").hide();
        $("#pieChartButton").toggleClass('active');
        hideAllCharts();
        $("#pieChart").show();
        $("#pieChartSummary").show();
    });

    // When the user click the "Bar Chart" button
    $("#barChartButton").click(function () {
        inactiveAllButtons();
        $("#barLineChartButton").toggleClass('active');
        $("#barChartButton").toggleClass('active');
        hideAllCharts();
        $("#columnChart").show();
    });

    // When the user click the "Line Chart" button
    $("#lineChartButton").click(function () {
        inactiveAllButtons();
        $("#barLineChartButton").toggleClass('active');
        $("#lineChartButton").toggleClass('active');
        hideAllCharts();
        $("#lineChart").show();
    });
}

/**
 * Inactive all chart selection buttons.
 */
function inactiveAllButtons() {
    $("#barLineChartButton").removeClass('active');
    $("#pieChartButton").removeClass('active');
    $("#barChartButton").removeClass('active');
    $("#lineChartButton").removeClass('active');
}

/**
 * Hide all charts in overall analytics.
 */
function hideAllCharts() {
    $("#columnChart").hide();
    $("#lineChart").hide();
    $("#pieChart").hide();
    $("#pieChartSummary").hide();
}

/**
 * Create datatable and return the bootstrap datatable.
 *
 * @param table each table's ID
 * @returns {jQuery} DataTable
 */
function createDataTable(table) {
    return table.DataTable({
        "ordering": false,
        "bFilter": false,
        "lengthChange": false,
        "columnDefs": [
            {"width": "50%", "targets": 0}
        ],
    });
}

/**
 * "Number of top articles" form submission
 */
function numberOfTopArticlesChange() {
    //Number of top articles form submit
    $("#formNumberOfTopArticles").submit(function (e) {
        var numberOfTopArticles = $("#numberOfTopArticles").val();
        // if the number of top articles number is valid
        if ($.isNumeric(numberOfTopArticles)) {
            // clear all datatable
            highestRevisionsTable.clear();
            lowestRevisionsTable.clear();
            highestGroupTable.clear();
            lowestGroupTable.clear();
            longestHistoryTable.clear();
            shortestHistoryTable.clear();
            // add new rows into datatable by the number of top articles
            getHighestRevisions(numberOfTopArticles);
            getLowestRevisions(numberOfTopArticles);
            getHighestGroupTable(numberOfTopArticles);
            getLowestGroupTable(numberOfTopArticles);
            getLongestHistoryTable(numberOfTopArticles);
            getShortestHistoryTable(numberOfTopArticles);
        }
        e.preventDefault();
    });
}

/**
 * The top two articles with the highest number of revisions and their number of revisions.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getHighestRevisions(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: -1};
    $.get('analytics/findHighestLowestRevisions', parameters, function (result) {
        $.each(result, function (key, value) {
            highestRevisionsTable.row.add([value["_id"], value["sumRevisions"]]).draw();
        })
    });
}

/**
 * The top two articles with the lowest number of revisions and their number of revisions.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getLowestRevisions(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: 1};
    $.get('analytics/findHighestLowestRevisions', parameters, function (result) {
        $.each(result, function (key, value) {
            lowestRevisionsTable.row.add([value["_id"], value["sumRevisions"]]).draw();
        })
    });
}

/**
 * The top two articles edited by the largest group of registered users and their group size.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getHighestGroupTable(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: -1};
    $.get('analytics/findHighestLowestGroup', parameters, function (result) {
        $.each(result, function (key, value) {
            highestGroupTable.row.add([value["_id"], value["sumUsers"]]).draw();
        })
    });
}

/**
 * The top two articles edited by the smallest group of registered users and their group size.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getLowestGroupTable(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: 1};
    $.get('analytics/findHighestLowestGroup', parameters, function (result) {
        $.each(result, function (key, value) {
            lowestGroupTable.row.add([value["_id"], value["sumUsers"]]).draw();
        })
    });
}

/**
 * The top two articles edited by the smallest group of registered users and their group size.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getLongestHistoryTable(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: 1};
    $.get('analytics/findLongestShortestHistory', parameters, function (result) {
        $.each(result, function (key, value) {
            var date = getAge(value["creationTime"]);
            longestHistoryTable.row.add([value["_id"], date[0], date[1]]).draw();
        })
    });
}

/**
 * The top two articles edited by the smallest group of registered users and their group size.
 * @param numberOfTopArticles The number of the top articles for the datatable
 */
function getShortestHistoryTable(numberOfTopArticles) {
    var parameters = {numberOfTopArticles: numberOfTopArticles, sortOrder: -1};
    $.get('analytics/findLongestShortestHistory', parameters, function (result) {
        $.each(result, function (key, value) {
            var date = getAge(value["creationTime"]);
            shortestHistoryTable.row.add([value["_id"], date[0], date[1]]).draw();
        })
    });
}

/**
 * The revision number distribution by year and by user type across the whole dataset.
 */
function getUserTypeByYear() {
    $.get('analytics/findUserTypeByYear', function (result) {
        var dataTableArray = userTypeByYearFilter(result);
        // console.log(dataTableArray)
        google.charts.load('current', {'packages': ['bar', 'line']});
        google.charts.setOnLoadCallback(drawChart);

        /**
         * Draw the bar chart and the line chart
         */
        function drawChart() {
            var data = google.visualization.arrayToDataTable(dataTableArray);
            var options = {
                chart: {
                    title: 'Revision number distribution by year and by user type',
                },
                bars: 'vertical',
                vAxis: {format: 'decimal'},
                width: 1000,
                height: 500,
            };
            var barChart = new google.charts.Bar($("#columnChart")[0]);
            barChart.draw(data, google.charts.Bar.convertOptions(options));
            var lineChart = new google.charts.Line($("#lineChart")[0]);
            google.visualization.events.addListener(lineChart, 'ready', function () {
                $("#lineChart").hide();
            });
            lineChart.draw(data, google.charts.Bar.convertOptions(options));
        }
    });
}

/**
 * The revision number distribution by user type across the whole dataset.
 */
function getUserType() {
    $.get('analytics/findUserType', function (result) {
        var dataTableArray = userTypeFilter(result);
        createSummaryOfPieChart(dataTableArray);
        google.charts.load('current', {'packages': ['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        /**
         * Draw the pie chart
         */
        function drawChart() {
            var data = google.visualization.arrayToDataTable(dataTableArray);

            var options = {
                title: 'Revision number distribution by user type',
                sliceVisibilityThreshold: 0,
                width: 1000,
                height: 500,
            };
            var chart = new google.visualization.PieChart(document.getElementById('pieChart'));
            google.visualization.events.addListener(chart, 'ready', function () {
                $("#pieChart").hide();
                $("#pieChartSummary").hide();
            });
            chart.draw(data, options);
        }
    });
}

/**
 * Create summary of the pie chart.
 *
 * @param dataTableArray Data of the pie chart array
 */
function createSummaryOfPieChart(dataTableArray) {
    var data = dataTableArray.slice();
    // Remove the column of the pie chart data
    data.shift();
    var totalNumber = 0;
    // Simplify the data array
    for (var i = 0; i < 4; i++) {
        data[i][0] = data[i][0] === "Regular user" ? "regular" : data[i][0];
        totalNumber += data[i][1];
    }
    // Sort the data array
    data.sort((a, b) => (a[1] > b[1]) ? -1 : ((b[1] > a[1]) ? 1 : 0));
    // Set replacement of the summary
    var replacements = {
        "%totalNumber%": boldText(totalNumber),
        "%mostUserType%": boldText(data[0][0].toLowerCase()),
        "%mostUserPercent%": boldText(((data[0][1] / totalNumber) * 100).toFixed(1)),
        "%secondUserType%": boldText(data[1][0].toLowerCase()),
        "%secondUserPercent%": boldText(((data[1][1] / totalNumber) * 100).toFixed(1)),
        "%thirdUserType%": boldText(data[2][0].toLowerCase()),
        "%thirdUserPercent%": boldText(((data[2][1] / totalNumber) * 100).toFixed(1)),
        "%lastUserType%": boldText(data[3][0].toLowerCase()),
        "%lastUserPercent%": boldText(((data[3][1] / totalNumber) * 100).toFixed(1)),
    };
    // Create the summary of the pie chart
    var summary = "The graph shows the revision number distribution by user type, there are total %totalNumber% " +
        "number of revisions. From the pie chart, it is clear that the revisions were made mostly by %mostUserType% " +
        "users that cover for %mostUserPercent% percent, followed by %secondUserType% users with %secondUserPercent% " +
        "percent. The %thirdUserType% users stands at %thirdUserPercent% percent, which is larger than revisions " +
        "made by %lastUserType% users (%lastUserPercent% percent).";
    // Replace the summary by the replacement
    summary = summary.replace(/%\w+%/g, function (all) {
        return replacements[all] || all;
    });
    $("#pieChartSummary").html("<p>" + summary + "</p>");
}

/**
 * Set bold text
 *
 * @param text Replacement texts
 * @returns {string} Bold replacement texts
 */
function boldText(text) {
    return "<b>" + text + "</b>";
}

/**
 * Filter the result for the pie chart
 *
 * @param result Result from the back-end
 * @returns {[]} Pie chart data array
 */
function userTypeFilter(result) {
    var pieChartDataTable = [];
    pieChartDataTable.push(["User type", "Revision number distribution"]);
    //admin=1; anonymous=2; bot=3; regular=4; adminAndBot=5;
    pieChartDataTable.push(["Administrator", 0]);
    pieChartDataTable.push(["Anonymous", 0]);
    pieChartDataTable.push(["Bot", 0]);
    pieChartDataTable.push(["Regular user", 0]);
    $.each(result, function (key, value) {
        var userType = value["_id"]["userType"];
        var dataTableIndex = 0;
        switch (userType) {
            case "admin":
                dataTableIndex = 1;
                break;
            case "anonymous":
                dataTableIndex = 2;
                break;
            case "bot":
                dataTableIndex = 3;
                break;
            case "regular":
                dataTableIndex = 4;
                break;
            case "adminAndBot":
                dataTableIndex = 5;
                break;
        }
        if (dataTableIndex === 5) {
            pieChartDataTable[1][1] += value["total"];
            pieChartDataTable[3][1] += value["total"];
        } else {
            pieChartDataTable[dataTableIndex][1] += value["total"];
        }
    });
    return pieChartDataTable;
}

/**
 * Filter the result for the bar chart and line chart
 *
 * @param result Result from the back-end
 * @returns {[]} Bar/Line chart data array
 */
function userTypeByYearFilter(result) {
    //result type: [{userType:"...",year:"...","total":"..."},...]
    var barChartDataTable = [];
    barChartDataTable.push(["Year", "Administrator", "Anonymous", "Bot", "Regular user"])
    $.each(result, function (key, value) {
        //admin=1; anonymous=2; bot=3; regular=4; adminAndBot=5;
        var dataTableIndex = 0;
        // if the year is finding in the barChartDataTable, then add results, otherwise set the new year
        barChartDataTable.find(e =>
            e[0] === value["year"]
        ) === undefined ? barChartDataTable.push([value["year"], 0, 0, 0, 0]) : "";
        switch (value["userType"]) {
            case "admin":
                dataTableIndex = 1;
                break;
            case "anonymous":
                dataTableIndex = 2;
                break;
            case "bot":
                dataTableIndex = 3;
                break;
            case "regular":
                dataTableIndex = 4;
                break;
            case "adminAndBot":
                dataTableIndex = 5;
                break;
        }
        var arrayInYear = barChartDataTable.find(e =>
            e[0] === value["year"]
        );
        if (dataTableIndex === 5) {
            arrayInYear[1] += value["total"];
            arrayInYear[3] += value["total"];
        } else {
            arrayInYear[dataTableIndex] += value["total"];
        }
    });
    return barChartDataTable;
}

/**
 * Get age in days from the date to now
 *
 * @param dateInString Date from back-end
 * @returns {[*, number]} Age in days
 */
function getAge(dateInString) {
    var date = new Date(dateInString);
    var now = moment(new Date());
    var duration = moment.duration(now.diff(date));
    var days = duration.asDays();
    return [moment(date).format('MMMM Do YYYY, h:mm:ss a'), Math.floor(days)];
}