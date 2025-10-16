/**
 * Tailwind-inspired dark theme for Highcharts
 */
(function () {
    function getComputedColor(variableName, fallback) {
        if (typeof window === 'undefined' || !window.getComputedStyle) {
            return fallback;
        }
        var value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
        value = value ? value.trim() : '';
        return value || fallback;
    }

    var accent = getComputedColor('--accent-color', '#0ea5e9');
    var accentDark = getComputedColor('--accent-color-dark', '#0284c7');

    var palette = [
        accent,
        '#a855f7',
        '#38bdf8',
        '#f97316',
        '#34d399',
        '#facc15',
        '#f472b6',
        '#94a3b8',
        '#22d3ee',
        '#fb7185'
    ];

    Highcharts.theme = {
        colors: palette,
        chart: {
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                color: '#e2e8f0'
            },
            spacing: [16, 16, 16, 16]
        },
        title: {
            useHTML: true,
            style: {
                color: '#f1f5f9',
                fontSize: '16px',
                fontWeight: 600
            }
        },
        subtitle: {
            style: {
                color: '#cbd5f5'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            borderColor: 'rgba(148, 163, 184, 0.35)',
            style: {
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: 500
            },
            shadow: false,
            borderRadius: 12
        },
        legend: {
            itemStyle: {
                color: '#cbd5f5',
                fontWeight: 500,
                fontSize: '13px'
            },
            itemHoverStyle: {
                color: '#f8fafc'
            }
        },
        xAxis: {
            lineColor: 'rgba(148, 163, 184, 0.25)',
            tickColor: 'rgba(148, 163, 184, 0.25)',
            labels: {
                style: {
                    color: '#94a3b8',
                    fontSize: '12px'
                }
            },
            title: {
                style: {
                    color: '#cbd5f5'
                }
            },
            gridLineColor: 'rgba(148, 163, 184, 0.12)'
        },
        yAxis: {
            gridLineColor: 'rgba(148, 163, 184, 0.12)',
            gridLineDashStyle: 'Dash',
            labels: {
                style: {
                    color: '#94a3b8',
                    fontSize: '12px'
                }
            },
            title: {
                style: {
                    color: '#cbd5f5'
                }
            }
        },
        plotOptions: {
            series: {
                animation: { duration: 600 },
                marker: {
                    lineWidth: 0,
                    symbol: 'circle'
                },
                states: {
                    hover: {
                        halo: {
                            size: 6,
                            attributes: {
                                fill: accent,
                                opacity: 0.25
                            }
                        }
                    }
                }
            },
            column: {
                borderRadius: 4
            },
            pie: {
                borderColor: '#0f172a',
                dataLabels: {
                    connectorColor: 'rgba(148, 163, 184, 0.4)',
                    style: {
                        color: '#e2e8f0',
                        fontWeight: 500
                    }
                }
            },
            map: {
                nullColor: '#1e293b',
                borderColor: 'rgba(148, 163, 184, 0.25)'
            }
        },
        navigator: {
            maskFill: 'rgba(148, 163, 184, 0.15)',
            series: {
                color: accent,
                lineColor: accent
            },
            xAxis: {
                gridLineColor: 'rgba(148, 163, 184, 0.12)'
            }
        },
        rangeSelector: {
            buttonTheme: {
                fill: 'rgba(148, 163, 184, 0.12)',
                stroke: 'transparent',
                'stroke-width': 0,
                style: {
                    color: '#cbd5f5',
                    fontWeight: 500
                },
                states: {
                    hover: {
                        fill: 'rgba(148, 163, 184, 0.22)',
                        style: {
                            color: '#f8fafc'
                        }
                    },
                    select: {
                        fill: accent,
                        style: {
                            color: '#0f172a'
                        }
                    }
                }
            },
            inputBoxBorderColor: 'rgba(148, 163, 184, 0.2)',
            inputStyle: {
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#e2e8f0'
            },
            labelStyle: {
                color: '#94a3b8',
                fontWeight: 500
            }
        },
        scrollbar: {
            barBackgroundColor: 'rgba(148, 163, 184, 0.2)',
            trackBackgroundColor: 'rgba(148, 163, 184, 0.06)',
            buttonArrowColor: '#94a3b8'
        },
        global: {
            useUTC: false
        }
    };

    Highcharts.setOptions(Highcharts.theme);

    // Update theme when accent color changes via color picker (if available)
    document.addEventListener('color:accent-change', function() {
        var newAccent = getComputedColor('--accent-color', accent);
        Highcharts.setOptions({ colors: [newAccent].concat(palette.slice(1)) });
    });
})();
