class GaugeChart {
    constructor(element, params) {
        this._element = element;
        this._initialValue = params.initialValue;
        this._higherValue = params.higherValue;
        this._title = params.title;
        this._subtitle = params.subtitle;
        this._customTicks = params.customTicks;
    }
    _buildConfig() {
        let element = this._element;
        return {
            value: this._initialValue,
            valueIndicator: {
                color: '#fff'
            },
            geometry: {
                startAngle: 180,
                endAngle: 360
            },
            scale: {
                startValue: 0,
                endValue: this._higherValue,
                customTicks: this._customTicks,
                tick: {
                    length: 8
                },
                label: {
                    font: {
                        color: '#87959f',
                        size: 9,
                        family: '"Open Sans", sans-serif'
                    }
                }
            },
            title: {
                verticalAlignment: 'bottom',
                text: this._title,
                font: {
                    family: '"Open Sans", sans-serif',
                    color: 'var(--color- contrast - higher, #1C1C21)',
                    size: 10
                },
                subtitle: {
                    text: this._subtitle,
                    font: {
                        family: '"Open Sans", sans-serif',
                        color: 'var(--color- contrast - higher, #1C1C21)',
                        weight: 700,
                        size: 25
                    }
                }
            },
            onInitialized: function () {
                let currentGauge = $(element);
                let circle = currentGauge.find('.dxg-spindle-hole').clone();
                let border = currentGauge.find('.dxg-spindle-border').clone();
                currentGauge.find('.dxg-title text').first().attr('y', 48);
                currentGauge.find('.dxg-title text').last().attr('y', 28);
                currentGauge.find('.dxg-value-indicator').append(border, circle);
            }
        }
    }
    init() {
        $(this._element).dxCircularGauge(this._buildConfig());
    }
}