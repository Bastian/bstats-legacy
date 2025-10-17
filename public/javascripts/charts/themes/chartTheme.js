(function (Highcharts) {
    if (typeof Highcharts === 'undefined') {
        return;
    }

    var palette = [
        '#10B981', // emerald
        '#0EA5E9', // sky
        '#6366F1', // indigo
        '#F97316', // orange
        '#F59E0B', // amber
        '#14B8A6', // teal
        '#EC4899', // pink
        '#8B5CF6', // violet
        '#38BDF8', // light sky
        '#F472B6'  // fuchsia
    ];

    Highcharts.setOptions({
        colors: palette,
        chart: {
            backgroundColor: 'transparent',
            plotBackgroundColor: 'transparent',
            style: {
                fontFamily: '"Inter", sans-serif',
                color: '#0f172a'
            },
            spacing: [18, 18, 18, 18],
            plotBorderColor: 'transparent'
        },
        title: {
            style: {
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '15px'
            }
        },
        subtitle: {
            style: {
                color: '#64748b',
                fontSize: '12px'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            backgroundColor: '#0f172a',
            borderWidth: 0,
            borderRadius: 12,
            shadow: {
                color: 'rgba(15, 23, 42, 0.18)',
                offsetX: 0,
                offsetY: 12,
                opacity: 0.2,
                width: 20
            },
            style: {
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 500
            }
        },
        legend: {
            align: 'left',
            verticalAlign: 'top',
            itemStyle: {
                color: '#0f172a',
                fontWeight: 500,
                fontSize: '12px'
            },
            itemHoverStyle: {
                color: '#0f172a'
            }
        },
        xAxis: {
            lineColor: '#e2e8f0',
            tickColor: '#e2e8f0',
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash',
            labels: {
                style: {
                    color: '#64748b',
                    fontSize: '11px'
                }
            },
            title: {
                style: {
                    color: '#64748b',
                    fontWeight: 500
                }
            }
        },
        yAxis: {
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash',
            labels: {
                style: {
                    color: '#64748b',
                    fontSize: '11px'
                }
            },
            title: {
                style: {
                    color: '#64748b',
                    fontWeight: 500
                }
            }
        },
        plotOptions: {
            series: {
                marker: {
                    lineWidth: 0,
                    radius: 4,
                    symbol: 'circle'
                },
                shadow: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            line: {
                lineWidth: 2.5
            },
            spline: {
                lineWidth: 2.5
            },
            area: {
                fillOpacity: 0.18
            },
            bar: {
                borderRadius: 6,
                dataLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 600,
                        color: '#0f172a'
                    }
                }
            },
            column: {
                borderRadius: 6
            },
            pie: {
                borderWidth: 0,
                dataLabels: {
                    style: {
                        color: '#0f172a',
                        fontWeight: 600
                    }
                }
            },
            map: {
                shadow: false,
                nullColor: '#e2e8f0'
            }
        },
        navigator: {
            maskFill: 'rgba(16, 185, 129, 0.2)',
            series: {
                color: '#10B981',
                lineColor: '#10B981'
            }
        },
        rangeSelector: {
            inputEnabled: false,
            buttonTheme: {
                fill: 'transparent',
                stroke: '#cbd5f5',
                'stroke-width': 1,
                padding: 2,
                height: 22,
                style: {
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '11px',
                    lineHeight: '14px'
                },
                states: {
                    hover: {
                        fill: '#e2e8f0'
                    },
                    select: {
                        fill: '#10B981',
                        style: {
                            color: '#ffffff'
                        }
                    }
                }
            },
            labelStyle: {
                color: '#475569'
            }
        },
        scrollbar: {
            barBackgroundColor: '#cbd5f5',
            trackBackgroundColor: '#e2e8f0',
            trackBorderColor: '#cbd5f5'
        },
        mapNavigation: {
            buttonOptions: {
                theme: {
                    fill: '#f1f5f9',
                    stroke: '#cbd5f5',
                    'stroke-width': 1,
                    r: 6,
                    style: {
                        color: '#475569'
                    },
                    states: {
                        hover: {
                            fill: '#10B981',
                            style: {
                                color: '#ffffff'
                            }
                        },
                        select: {
                            fill: '#10B981',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            }
        },
        global: {
            useUTC: false
        }
    });
})(Highcharts);
