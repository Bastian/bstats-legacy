function getAccentColor(defaultColor) {
    if (typeof window === 'undefined' || !window.getComputedStyle) {
        return defaultColor || '#0ea5e9';
    }
    var value = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    value = value ? value.trim() : '';
    return value || defaultColor || '#0ea5e9';
}

$(function () {
    $.getJSON('/api/v1/plugins/' + getPluginId() + '/charts', function (charts) { // Get all charts of the plugin
        for (var chart in charts) {
            if (!charts.hasOwnProperty(chart)) {
                continue;
            }
            switch (charts[chart].type) {
                case 'simple_pie':
                case 'advanced_pie':
                    handlePieChart(chart, charts[chart]);
                    break;
                case 'drilldown_pie':
                    handleDrilldownPieChart(chart, charts[chart]);
                    break;
                case 'single_linechart':
                    handleLineChart(chart, charts[chart]);
                    break;
                case 'simple_bar':
                case 'advanced_bar':
                    handleBarChart(chart, charts[chart]);
                    break;
                case 'simple_map':
                case 'advanced_map':
                    handleMapChart(chart, charts[chart]);
                    break;
                default:
                    break;
            }
        }
    });
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
                text: '<a href="#' + chartId + '" style="text-decoration: none; color: inherit;">' + chart.title + '</a>'
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
                    size: 220,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: $(window).width() > 600,
                        format: '<span style="font-weight:600">{point.name}</span><br>{point.percentage:.1f}%',
                        distance: 24,
                        style: {
                            color: '#e2e8f0',
                            textOutline: 'none'
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
                text: '<a href="#' + chartId + '" style="text-decoration: none; color: inherit;">' + chart.title + '</a>'
            },
            subtitle: {
                text: 'Click the slices to view details.'
            },
            plotOptions: {
                pie: {
                    size: 220,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: $(window).width() > 600,
                        format: '<span style="font-weight:600">{point.name}</span><br>{point.percentage:.1f}%',
                        distance: 24,
                        style: {
                            color: '#e2e8f0',
                            textOutline: 'none'
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
        var showMarkers = data.length <= 120;
        $('#' + chartId + 'LineChart').highcharts('StockChart', {

            chart:{
                zoomType: 'x',
                backgroundColor: 'transparent',
                spacing: [12, 16, 16, 16]
            },

            rangeSelector: {
                enabled: true,
                buttons: [{
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
                }],
                selected: 3,
                inputEnabled: !isMobile,
                inputDateFormat: '%e %b \'%y'
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
                        menuItems: [
                            'downloadPNG',
                            'downloadSVG',
                            'separator',
                            'downloadCSV',
                            'downloadXLS',
                            'viewData',
                            'separator',
                            'loadFullData'
                        ]
                    }
                }
            },

            xAxis: {
                ordinal: false,
                gridLineColor: 'rgba(148, 163, 184, 0.08)',
                crosshair: {
                    color: getAccentColor('rgba(14,165,233,0.65)'),
                    width: 1
                }
            },

            yAxis: {
                min: 0,
                gridLineColor: 'rgba(148, 163, 184, 0.12)',
                gridLineDashStyle: 'Dash',
                tickPixelInterval: 64,
                labels: {
                    formatter: function () {
                        if (this.value % 1 !== 0) {
                            return '';
                        }
                        return this.value;
                    }
                },
                title: {
                    text: chart.yAxis && chart.yAxis.text ? chart.yAxis.text : null
                }
            },

            tooltip: {
                shared: true,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.35)'
            },

            title : {
                text : '<a href="#' + chartId + '" style="text-decoration: none; color: inherit;">' + chart.title + '</a>'
            },

            plotOptions:{
                series: {
                    turboThreshold: 0, // disable the 1000 limit
                    lineWidth: 2.5,
                    states: {
                        hover: {
                            lineWidth: 3
                        }
                    },
                    marker: {
                        enabled: showMarkers,
                        radius: 3,
                        symbol: 'circle'
                    }
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
        var categories = data.map(function (d) { return d.name; });
        var estimatedHeight = Math.max(340, categories.length * chart.data.barNames.length * 34 + 160);
        $('#' + chartId + 'Bar').highcharts({
            chart: {
                type: 'bar',
                backgroundColor: 'transparent',
                spacing: [16, 24, 32, 16],
                height: estimatedHeight
            },
            title: {
                text: '<a href="#' + chartId + '" style="text-decoration: none; color: inherit;">' + chart.title + '</a>'
            },
            xAxis: {
                categories: categories,
                lineColor: 'rgba(148, 163, 184, 0.2)',
                gridLineColor: 'rgba(148, 163, 184, 0.12)',
                labels: {
                    style: {
                        color: '#cbd5f5',
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                min: 0,
                gridLineColor: 'rgba(148, 163, 184, 0.12)',
                title: {
                    text: chart.data.valueName || null
                },
                labels: {
                    style: {
                        color: '#94a3b8',
                        fontSize: '12px'
                    }
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#e2e8f0',
                            textOutline: 'none',
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                series: {
                    borderRadius: 6,
                    pointPadding: 0.15,
                    groupPadding: 0.12,
                    maxPointWidth: 28
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.35)',
                style: {
                    color: '#e2e8f0'
                },
                headerFormat: '<span style="font-size:13px;font-weight:600">{point.key}</span><br/>',
                pointFormat: '<span style="color:{series.color};font-weight:600">{series.name}</span>: {point.y}' + (chart.data.valueName ? ' ' + chart.data.valueName : '')
            },
            legend: {
                layout: 'horizontal',
                align: 'left',
                verticalAlign: 'top',
                itemStyle: {
                    color: '#cbd5f5',
                    fontWeight: 500
                },
                itemHoverStyle: {
                    color: '#f8fafc'
                },
                symbolRadius: 6
            },
            exporting: {
                enabled: true
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

        var accent = getAccentColor('#38bdf8');
        var accentSoft = Highcharts.color(accent).setOpacity(0.18).get('rgba');
        var accentMid = Highcharts.color(accent).setOpacity(0.45).get('rgba');
        var accentStrong = Highcharts.color(accent).brighten(-0.1).get();
        var valueLabel = chart.data.valueName || '';

        $('#' + chartId + 'Map').highcharts('Map', {

            chart: {
                backgroundColor: 'transparent',
                spacing: [12, 12, 12, 12]
            },

            title: {
                text: '<a href="#' + chartId + '" style="text-decoration: none; color: inherit;">' + chart.title + '</a>'
            },

            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                borderRadius: 18,
                borderWidth: 0,
                padding: 14,
                title: {
                    text: chart.data.valueName,
                    style: {
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '12px'
                    }
                },
                itemStyle: {
                    color: '#cbd5f5'
                },
                itemHoverStyle: {
                    color: '#f8fafc'
                }
            },

            exporting: {
                enabled: true
            },

            mapNavigation: {
                enabled: true,
                enableMouseWheelZoom: false,
                buttonOptions: {
                    verticalAlign: 'top',
                    theme: {
                        fill: 'rgba(148, 163, 184, 0.12)',
                        'stroke-width': 0,
                        states: {
                            hover: {
                                fill: 'rgba(148, 163, 184, 0.24)'
                            },
                            select: {
                                fill: accent
                            }
                        }
                    }
                }
            },

            tooltip: {
                useHTML: true,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.35)',
                borderRadius: 12,
                shadow: false,
                padding: 12,
                pointFormat: '<div class="flex items-center gap-2"><span class="f32"><span class="flag {point.flag}"></span></span><span>{point.name}</span></div><div style="margin-top:6px;font-weight:600;font-size:14px;">{point.value}' + (valueLabel ? ' ' + valueLabel : '') + '</div>'
            },

            colorAxis: {
                min: 1,
                type: 'logarithmic',
                stops: [
                    [0, accentSoft],
                    [0.5, accentMid],
                    [1, accentStrong]
                ],
                minorTickInterval: 0,
                tickPixelInterval: 150
            },

            series : [{
                data : data,
                mapData: Highcharts.maps['custom/world'],
                joinBy: ['iso-a2', 'code'],
                name: valueLabel,
                color: accent,
                nullColor: '#1e293b',
                borderColor: 'rgba(148, 163, 184, 0.25)',
                shadow: false,
                states: {
                    hover: {
                        color: accentStrong
                    }
                }
            }]
        });
    });
}
