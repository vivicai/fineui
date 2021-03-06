/**
 * Created by zcf on 2016/9/22.
 */
BI.SliderIconButton = BI.inherit(BI.Widget, {
    _defaultConfig: function () {
        return BI.extend(BI.SliderIconButton.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-single-slider-button"
        });
    },
    _init: function () {
        BI.extend(BI.SliderIconButton.superclass._init.apply(this, arguments));
        this.slider = BI.createWidget({
            type: "bi.icon_button",
            cls: "slider-icon slider-button",
            iconWidth: 14,
            iconHeight: 14,
            height: 14,
            width: 14
        });
        BI.createWidget({
            type: "bi.absolute",
            element: this,
            items: [{
                el: this.slider,
                top: 7,
                left: -7
            }],
            width: 0,
            height: 14
        });
    }
});
BI.shortcut("bi.single_slider_button", BI.SliderIconButton);