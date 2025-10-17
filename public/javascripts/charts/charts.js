$(function () {
    var renderedCharts = {};
    var chartsCache = null;

    function getContainerId(chartId, type) {
        switch (type) {
            case 'single_linechart':
                return chartId + 'LineChart';
            case 'simple_map':
            case 'advanced_map':
                return chartId + 'Map';
            case 'simple_bar':
            case 'advanced_bar':
                return chartId + 'Bar';
            case 'simple_pie':
            case 'advanced_pie':
            case 'drilldown_pie':
            default:
                return chartId + 'Pie';
        }
    }

    function renderCharts(charts, attempt) {
        if (!charts) {
            return;
        }
        attempt = attempt || 0;
        var hasMissingContainer = false;

        for (var chartId in charts) {
            if (!charts.hasOwnProperty(chartId) || renderedCharts[chartId]) {
                continue;
            }

            var chart = charts[chartId];
            var containerId = getContainerId(chartId, chart.type);
            if (!document.getElementById(containerId)) {
                hasMissingContainer = true;
                continue;
            }

            renderedCharts[chartId] = true;

            switch (chart.type) {
                case 'simple_pie':
                case 'advanced_pie':
                    handlePieChart(chartId, chart);
                    break;
                case 'drilldown_pie':
                    handleDrilldownPieChart(chartId, chart);
                    break;
                case 'single_linechart':
                    handleLineChart(chartId, chart);
                    break;
                case 'simple_bar':
                case 'advanced_bar':
                    handleBarChart(chartId, chart);
                    break;
                case 'simple_map':
                case 'advanced_map':
                    handleMapChart(chartId, chart);
                    break;
                default:
                    break;
            }
        }

        if (hasMissingContainer && attempt < 25) {
            setTimeout(function () {
                renderCharts(charts, attempt + 1);
            }, 100);
        }
    }

    $(document).on('bstats:charts-shell-ready', function (event, charts) {
        chartsCache = charts;
        renderCharts(chartsCache);
    });

    if (!window.__bstatsCustomLayout) {
        $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts', function (charts) {
            chartsCache = charts;
            renderCharts(chartsCache);
        });
    } else if (window.__bstatsCharts) {
        chartsCache = window.__bstatsCharts;
        renderCharts(chartsCache);
    }
});

function handlePieChart(chartId, chart) {
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data', function (data) {

        if (data.length > 20) { // Make the chart smaller by hiding elements with less than 1%
            var total = 0;
            for (var i = 0; i < data.length; i++) {
                total += data[i].y;
            }
            var otherCount = 0;
            for (var i = data.length - 1; i >= 0; i--) { // We loop backwards because we may remove some elements
                if (data[i].y < total / 200) {
                    otherCount += data[i].y;
                    data.splice(i, 1);
                }
            }
            if (otherCount > 0) {
                data.push({name: "Other", y: otherCount});
            }
        }

        data.sort(function compare(a, b) {
            if (a.y > b.y) {
                return -1;
            } else if (a.y < b.y) {
                return 1;
            }
            return 0;
        });

        $('#' + chartId + 'Pie').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: null
            },
            tooltip: {
                headerFormat: '<span style="font-size: 18px"><u><b>{point.key}</b></u></span><br/>',
                pointFormat: '<b>Share</b>: {point.percentage:.1f} %<br><b>Total</b>: {point.y}'
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    size: 180,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: $(window).width() > 600,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: $(window).width() <= 600
                }
            },
            series: [{
                name: chart.title,
                colorByPoint: true,
                data: data
            }]
        });
    });
}

function handleDrilldownPieChart(chartId, chart) {
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data', function (data) {

        for (var j = 0; j < data.drilldownData.length; j++) {
            if (data.drilldownData[j].data.length > 20) { // Make the chart smaller by hiding elements with less than 1%
                var total = 0;
                for (var i = 0; i < data.drilldownData[j].data.length; i++) {
                    total += data.drilldownData[j].data[i][1];
                }
                var otherCount = 0;
                for (var i = data.drilldownData[j].data.length - 1; i >= 0; i--) { // We loop backwards because we may remove some elements
                    if (data.drilldownData[j].data[i][1] < total / 200) {
                        otherCount += data.drilldownData[j].data[i][1];
                        data.drilldownData[j].data.splice(i, 1);
                    }
                }
                if (otherCount > 0) {
                    data.drilldownData[j].data.push(["Other", otherCount]);
                }

                data.drilldownData[j].data.sort(function compare(a, b) {
                    if (a[1] > b[1]) {
                        return -1;
                    } else if (a[1] < b[1]) {
                        return 1;
                    }
                    return 0;
                });
            }
        }



        $('#' + chartId + 'Pie').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: null
            },
            subtitle: {
                text: 'Click the slices to view details.'
            },
            plotOptions: {
                pie: {
                    size: 180,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: $(window).width() > 600,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: $(window).width() <= 600
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size: 18px"><u><b>{point.key}</b></u></span><br/>',
                pointFormat: '<b>Share</b>: {point.percentage:.1f} %<br><b>Total</b>: {point.y}'
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: chart.title,
                colorByPoint: true,
                data: data.seriesData
            }],
            drilldown: {
                series: data.drilldownData
            }
        });
    });
}

function handleLineChart(chartId, chart) {
    var isMobile = $(window).width() < 600;
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data/?maxElements=' + (2*24*31*1), function (data) {
        if (chartId === 'players') {
            updatePlayersBadge(data);
        } else if (chartId === 'servers') {
            updateServersBadge(data);
        }

        var rangeButtons = [{
            type: 'day',
            count: 1,
            text: '1d'
        }, {
            type: 'day',
            count: 3,
            text: '3d'
        }, {
            type: 'week',
            count: 1,
            text: '1w'
        }, {
            type: 'month',
            count: 1,
            text: '1m'
        }, {
            type: 'month',
            count: 6,
            text: '6m'
        }, {
            type: 'year',
            count: 1,
            text: '1y'
        }, {
            type: 'all',
            text: 'All'
        }];

        if (isMobile) {
            rangeButtons = [{
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'week',
                count: 1,
                text: '1w'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'all',
                text: 'All'
            }];
        }

        var baseButtonTheme = Highcharts.getOptions().rangeSelector.buttonTheme || {};
        var buttonTheme = Highcharts.merge(baseButtonTheme, {
            width: isMobile ? 38 : 48
        });

        $('#' + chartId + 'LineChart').highcharts('StockChart', {

            chart:{
                zoomType: 'x'
            },

            rangeSelector: {
                buttons: rangeButtons,
                buttonTheme: buttonTheme,
                buttonSpacing: 4,
                selected: 3,
                inputEnabled: false
            },

            exporting: {
                menuItemDefinitions: {
                    loadFullData: {
                        onclick: function () {
                            $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data/?maxElements=' + (2*24*30*12*2), function (data) {
                                $('#' + chartId + 'LineChart').highcharts().series[0].update({
                                    data: data
                                }, true);
                            });
                        },
                        text: 'Load full data'
                    }
                },
                buttons: {
                    contextButton: {
                        menuItems: ['loadFullData']
                    }
                }
            },

            xAxis: {
                ordinal: false
            },

            yAxis: {
                min: 0,
                labels: {
                    formatter: function () {
                        if (this.value % 1 != 0) {
                            return "";
                        } else {
                            return this.value;
                        }
                    }
                }
            },

            title : {
                text : null
            },

            plotOptions:{
                series: {
                    turboThreshold: 0 // disable the 1000 limit
                }
            },

            series : [{
                name : chart.data.lineName,
                data : data,
                type: 'spline',
                tooltip: {
                    valueDecimals: 0
                }
            }]
        });
    });
}

function handleBarChart(chartId, chart) {
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data', function (data) {
        $('#' + chartId + 'Bar').highcharts({
            chart: {
                type: 'bar',
                renderTo: 'container',
                marginTop: 40,
                marginBottom: 80,
                height: data.length * chart.data.barNames.length * (30 + chart.data.barNames.length * 15) + 120 // 20px per data item plus top and bottom margins
            },
            title: {
                text: null
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                },
                series: {
                    pointWidth: 25
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size: 18px"><u><b>{point.key}</b></u></span><br/>',
                pointFormat: '<b>Total</b>: {point.y} ' + chart.data.valueName
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            exporting: {
                enabled: false
            },
            yAxis: {
                min: 0,
                title: {
                    text: chart.data.valueName,
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            xAxis: {
                categories: data.map(d => d.name)
            },
            series: chart.data.barNames.map((barName, index) => ({
                name: barName,
                data: data.map(d => d.data[index])
            }))
        });
    });
}

function handleMapChart(chartId, chart) {
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts/' + chartId + '/data', function (data) {
        // Add lower case codes to the data set for inclusion in the tooltip.pointFormat
        $.each(data, function () {
            this.flag = this.code.replace('UK', 'GB').toLowerCase();
        });

        // Initiate the chart
        $('#' + chartId + 'Map').highcharts('Map', {

            title: {
                text: null
            },

            legend: {
                title: {
                    text: chart.data.valueName,
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                    }
                }
            },

            exporting: {
                enabled: false
            },

            mapNavigation: {
                enabled: true,
                enableMouseWheelZoom: false,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            tooltip: {
                backgroundColor: 'none',
                borderWidth: 0,
                shadow: false,
                useHTML: true,
                padding: 0,
                pointFormat: '<span class="f32"><span class="flag {point.flag}"></span></span>' +
                ' {point.name}: <b>{point.value}</b>',
                positioner: function () {
                    return { x: 0, y: 250 };
                }
            },

            colorAxis: {
                min: 1,
                max: 5000,
                type: 'logarithmic',
                minColor: '#FFCDD2',
                maxColor: '#B71C1C'
            },

            series : [{
                data : data,
                mapData: Highcharts.maps['custom/world'],
                joinBy: ['iso-a2', 'code'],
                name: chart.data.valueName,
                color: '#F44336',
                shadow: false,
                states: {
                    hover: {
                        color: '#B71C1C'
                    }
                }
            }]
        });
    });
}
