$(document).ready(async function () {
    await initAnalytics()
    $('#author-name-icon').on('click', function () {
        analyseAuthor($('#author-name').val())
    })
    $('#article-search-btn').on('click', function () {
        analyseArticle($('#article-select').val(), $('#article-from').val(), $('#article-to').val())
    })
})

let chart

/*
* Initialise analytics.
* This function is always called when the analytics page is loaded, requesting for necessary data and parsing
* default analytics results of Overall, Individual and Author Analytics components.
*/

async function initAnalytics() {
    Swal.fire({
        icon: 'info',
        title: 'Analysing Data ...',
        showConfirmButton: false,
        allowOutsideClick: false
    })
    $.when(getAuthorNames(), getArticlesInfo()).then(
        // All initialisation succeed, render results on the page
        (authorNames, articleInfo) => {
            autoCompleteAuthorName(authorNames.names)
            renderArticlesInfo(articleInfo.articlesInfo)
            Swal.close()
        },
        // One of the requests fails, reject the initialisation process
        () => {
            Swal.close()
            Toast.fire({
                icon: 'error',
                title: 'Server internal error, please refresh the page to retry'
            })
        })
}

/**
 * ================================================================================
 * Author Analytics Functions.
 * ================================================================================
 */

/**
 * Get all distinct author names
 */
async function getAuthorNames() {
    return $.post({
        url: '/analytics/get-authors',
    })
}

/**
 * Autocomplete author name
 */
function autoCompleteAuthorName(nameList) {
    $('#author-name').autocomplete({
        lookup: nameList,
        lookupLimit: 10,
        minChars: 2
    });
}

/**
 * Analyse revisions by input author name.
 *
 * @param {string} authorName - The author name that end user input.
 */
function analyseAuthor(authorName) {
    // validate input
    if (authorName === '') {
        Toast.fire({
            icon: 'error',
            title: 'Please type an author name.'
        })
    } else {
        let loadingContent = {
                title: 'Analysing ...',
                text: 'Analysing article revisions created by this author ...'
            },
            type = 'POST',
            url = 'analytics/analyse-by-author',
            data = {
                author: authorName
            },
            doneFn = (results) => {
                console.log(results)
                renderAuthorAnalyticsResults(results)
            },
            errorFn = (error) => {
                $('#author-analytics-results').empty()
            }

        sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
    }

}

/**
 * Render author analytics results on page.
 */
function renderAuthorAnalyticsResults(results) {
    let wrapper = $('#author-analytics-results')
    wrapper.empty()
    results.forEach((result, index) => {
        let card = $('<div/>').addClass('card')
        // result heading
        let cardHeading = $('<div/>').addClass('card-header').attr('id', `heading-${index}`)
        let button = $('<button/>').addClass('text-left m-0 p-0 btn btn-link btn-block').attr({
            'type': 'button',
            'data-toggle': 'collapse',
            'data-target': `#collapse-${index}`,
            'aria-expanded': 'true'
        })
        let h5 = $('<h5/>').addClass('m-0 p-0').append(
            $('<a/>').addClass('nav-link').append(
                $('<i/>').addClass('nav-link-icon lnr-inbox')
            ).append(
                $('<span/>').text(result._id)
            ).append(
                $('<div/>').addClass('ml-auto badge badge-pill badge-secondary').text(result.count)
            )
        )
        // result table
        let collapse = $('<div/>', {
                id: `collapse-${index}`,
                'class': 'collapse',
                'data-parent': '#author-analytics-results',
                'aria-labelledby': `heading-${index}`
            }),
            cardBody = $('<div/>', {
                'class': 'card-body'
            }),
            table = $('<table/>', {
                    'class': 'mb-0 table table-striped'
                }
            ),
            thead = $('<thead/>')
                .append($('<tr/>')
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 10%',
                        'text': '#'
                    }))
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 60%',
                        'text': 'Title'
                    }))
                    .append($('<th/>', {
                        'class': 'text-center',
                        'style': 'width: 20%',
                        'text': 'Timestamp'
                    }))),
            tbody = $('<tbody/>')
        result.timestamps.forEach((timestamp, index) => {
            tbody.append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'scope': 'row',
                    'text': index + 1
                }))
                .append($('<td/>', {
                    'class': 'text-center',
                    'text': result._id
                }))
                .append($('<td/>', {
                    'class': 'text-center',
                    'text': timestamp
                })))
        })

        card.append(cardHeading.append(button.append(h5)))
            .append(collapse.append(cardBody.append(table.append(thead).append(tbody))))
        wrapper.append(card)
    })
}

/**
 * -------------------------------------------------------------------------------
 * Individual Article Analytics Functions
 * --------------------------------------------------------------------------------
 */

/**
 * Send AJAX request to get all article titles and the number of their revisions.
 */
async function getArticlesInfo() {
    return $.post({
        url: 'analytics/get-articles',
    })
}

/**
 * Render articles information into the dropdown menu.
 */
function renderArticlesInfo(articlesInfo) {
    articlesInfo.forEach(info => {
        $('#article-select').append($('<option/>', {
            'text': `${info._id} (${info.count})`,
            'value': info._id
        }))
    })
}

/**
 * Send AJAX request to analyse selected article.
 */
function analyseArticle(article, from, to) {
    let start = parseInt(from),
        end = parseInt(to)
    if (start > end) {
        Toast.fire({
            icon: 'error',
            title: 'The from time could not be later than to time'
        })
    } else {
        let loadingContent = {
                title: 'Analysing ...',
                text: 'Making individual article analytics ...'
            },
            type = 'POST',
            url = '/analytics/analyse-article',
            data = {
                article: article,
                from: from,
                to: to
            },
            doneFn = (results) => {
                renderArticleSummary(results)
                renderArticleCharts(results)
                Toast.fire({
                    icon: 'success',
                    title: results.message
                })
            },
            errorFn = (error) => {
            }

        sendAjaxRequest(true, loadingContent, type, url, data, doneFn, errorFn, true)
    }
}

/**
 * Render analysed article information.
 */
function renderArticleSummary(data) {
    let wrapper = $('#article-analytics-results')
    wrapper.empty()
    let card = $('<div/>').addClass('card')
    // result heading
    let cardHeading = $('<div/>').addClass('card-header').attr('id', `article-heading-1`)
    let button = $('<button/>').addClass('text-left m-0 p-0 btn btn-link btn-block').attr({
        'type': 'button',
        'data-toggle': 'collapse',
        'data-target': `#article-collapse-1`,
        'aria-expanded': 'true'
    })
    let h5 = $('<h5/>').addClass('m-0 p-0').append(
        $('<a/>').addClass('nav-link').append(
            $('<i/>').addClass('nav-link-icon lnr-inbox')
        ).append(
            $('<span/>').text(data.title)
        ).append(
            $('<div/>').addClass('ml-auto badge badge-pill badge-secondary').text(data.revisionCount)
        )
    )

    // Collapse for top news and top regular users.
    let collapse = $('<div/>', {
        id: `article-collapse-1`,
        'class': 'collapse show',
        'data-parent': '#article-analytics-results',
        'aria-labelledby': `article-heading-1`
    })

    // Top 5 regular users table.
    let userCardBody = $('<div/>', {
            'class': 'card-body'
        }).append($('<h5/>', {
            'class': 'card-title',
            'text': 'Top 5 regular users on this article'
        })),
        userTable = $('<table/>', {
                'class': 'mb-0 table table-striped'
            }
        ),
        userThead = $('<thead/>')
            .append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 10%',
                    'text': '#'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 60%',
                    'text': 'Regular Users'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 20%',
                    'text': 'Contributions'
                }))),
        userTbody = $('<tbody/>')
    data.topRegularUsers.forEach((user, index) => {
        userTbody.append($('<tr/>')
            .append($('<th/>', {
                'class': 'text-center',
                'scope': 'row',
                'text': index + 1
            }))
            .append($('<td/>', {
                'class': 'text-center',
                'text': user._id
            }))
            .append($('<td/>', {
                'class': 'text-center',
                'text': user.count
            })))
    })
    // Top 3 news table.
    let newsCardBody = $('<div/>', {
            'class': 'card-body'
        }).append($('<h5/>', {
            'class': 'card-title',
            'text': 'Top 3 news about the individual article obtained'
        })),
        newsTable = $('<table/>', {
                'class': 'mb-0 table table-striped'
            }
        ),
        newsThead = $('<thead/>')
            .append($('<tr/>')
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 10%',
                    'text': '#'
                }))
                .append($('<th/>', {
                    'class': 'text-center',
                    'style': 'width: 90%',
                    'text': 'Regular Users'
                }))),
        newsTbody = $('<tbody/>')
    data.topNews.forEach((news, index) => {
        newsTbody.append($('<tr/>')
            .append($('<th/>', {
                'class': 'text-center',
                'scope': 'row',
                'text': index + 1
            }))
            .append($('<td/>', {
                'class': 'text-center'
            })
                .append($('<a/>', {
                    'href': news.url,
                    'text': news.title
                }))))
    })
    card.append(cardHeading.append(button.append(h5)))
        .append(collapse.append(userCardBody.append(userTable.append(userThead).append(userTbody)))
            .append(newsCardBody.append(newsTable.append(newsThead).append(newsTbody))))
    wrapper.append(card)
}

function renderArticleCharts(data) {
    // Render bar chart 1
    $('#article-analytics-chart-1').remove()
    $('#article-chart-1').append($('<canvas>', {
        'id': `article-analytics-chart-1`,
        'class': 'chartjs-render-monitor'
    }))
    let chartOneData = data.barChartOneData
    let ctx1 = $('#article-analytics-chart-1')
    renderBarChartByYearByType(ctx1, chartOneData)

    // Render pie chart
    $('#article-analytics-chart-2').remove()
    $('#article-chart-2').append($('<canvas>', {
        'id': `article-analytics-chart-2`,
        'class': 'chartjs-render-monitor'
    }))
    let chartTwoData = data.pieChartData
    console.log(chartTwoData)
    let ctx2 = $('#article-analytics-chart-2')
    let pieData = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 206, 86)',
                'rgba(75, 192, 192)'
            ],
        }]
    }
    let revCounts = {
        Regular: chartTwoData.regular,
        Bot: chartTwoData.bot,
        Administrator: chartTwoData.admin,
        Anonymous: chartTwoData.anonymous
    }
    console.log(revCounts)
    for (let [key, value] of Object.entries(revCounts)) {
        pieData.labels.push(key)
        pieData.datasets[0].data.push(value)
    }
    drawPieChar(ctx2, pieData)

    // Render chart 3
    for (let i =0; i<5; i++) {
        $(`#article-chart-user-${i}`).remove()
        $(`#article-chart3-user${i}`).append($('<canvas>', {
            'id': `article-chart-user-${i}`,
            'class': 'chartjs-render-monitor'
        }))
    }
    let chartThreeData = data.barChartTwoData
    let index = 0

    for (let [key, value] of Object.entries(data.barChartTwoData)) {
        let barData = {
            labels: [],
            datasets: [{
                label: key,
                data: [],
                backgroundColor: 'rgba(255, 99, 132)'
            }]
        }
        for (let year of value.years) {
            barData.labels.push(year)
        }
        for (let count of value.count) {
            barData.datasets[0].data.push(count)
        }
        $(`#tab-c1-${index} span`).text(key)
        $(`#article-chart3-user${index} h5`).text(`Revision number distribution by ${key}`)

        drawBarChart($(`#article-chart-user-${index}`), barData)
        index++
    }

}

/**
 * -------------------------------------------------------------------------------
 * Universal functions
 * --------------------------------------------------------------------------------
 */
function drawPieChar(ctx, data, options) {
    let myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    })
}

function drawBarChart(ctx, data, options) {
    let myPieChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    })
}

function renderBarChartByYearByType(ctx, data, options) {
    let minYear = Math.min(data.bot[0]._id, data.admin[0]._id, data.anon[0]._id, data.regular[0]._id)
    let maxYear = Math.max(data.bot.reverse()[0]._id, data.admin.reverse()[0]._id, data.anon.reverse()[0]._id, data.regular.reverse()[0]._id)
    let years = []
    for (let year = minYear; year <= maxYear; year++) {
        years.push(year)
    }
    let bot = reconstructUserTypesData(data.bot)
    let admin = reconstructUserTypesData(data.admin)
    let anon = reconstructUserTypesData(data.anon)
    let regular = reconstructUserTypesData(data.regular)
    let botData = buildBarChartDataByYear(years, bot)
    let adminData = buildBarChartDataByYear(years, admin)
    let anonData = buildBarChartDataByYear(years, anon)
    let regularData = buildBarChartDataByYear(years, regular)

    console.log(bot, admin, anon, regular)
    console.log(botData, adminData, anonData, regularData)

    let myPieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Bot',
                    data: botData,
                    backgroundColor: 'rgba(255, 99, 132)'
                },
                {
                    label: 'Administrator',
                    data: adminData,
                    backgroundColor: 'rgba(54, 162, 235)'
                },
                {
                    label: 'Anonymous',
                    data: anonData,
                    backgroundColor: 'rgba(255, 206, 86)'
                },
                {
                    label: 'Regular',
                    data: regularData,
                    backgroundColor: 'rgba(75, 192, 192)'
                }]
        },
        options: options
    });
}

function reconstructUserTypesData(data) {
    let result = {}
    for (let rec of data) {
        result[rec._id] = rec.count
    }
    return result
}

function buildBarChartDataByYear(year, data) {
    let result = []
    for (y of year) {
        result.push(data.hasOwnProperty(y) ? data[y] : 0)
    }
    return result
}
