class XMLEngineDisplay extends HTMLElement {
    constructor() {
        super(...arguments);
        this.context = new LogicXMLContext();
        this.CAS = null;
    }
    setConfiguration(_gps, _config) {
        this.gps = _gps;
        this.configuration = _config;
        this.gauges = [];
        this.texts = [];
        this.parseElement(this.configuration, this);
    }
    parseElement(_configElement, _element) {
        let gauges = _configElement.children;
        for (let i = 0; i < gauges.length; i++) {
            if (gauges[i].tagName == "Gauge") {
                let typeElem = gauges[i].getElementsByTagName("Type");
                if (typeElem.length > 0) {
                    let gauge;
                    switch (typeElem[0].textContent) {
                        case "Circular":
                            gauge = document.createElement("glasscockpit-xmlcirculargauge");
                            _element.appendChild(gauge);
                            break;
                        case "Horizontal":
                            gauge = document.createElement("glasscockpit-xmlhorizontalgauge");
                            _element.appendChild(gauge);
                            break;
                        case "DoubleHorizontal":
                            gauge = document.createElement("glasscockpit-xmlhorizontaldoublegauge");
                            _element.appendChild(gauge);
                            break;
                        case "Vertical":
                            gauge = document.createElement("glasscockpit-xmlverticalgauge");
                            _element.appendChild(gauge);
                            break;
                        case "DoubleVertical":
                            gauge = document.createElement("glasscockpit-xmlverticaldoublegauge");
                            _element.appendChild(gauge);
                            break;
                        case "Flaps":
                            let flapGauge = document.createElement("glasscockpit-xmlflapsgauge");
                            let toElement = gauges[i].getElementsByTagName("TakeOff");
                            if (toElement.length > 0) {
                                flapGauge.setTakeOffValue(parseFloat(toElement[0].textContent));
                            }
                            _element.appendChild(flapGauge);
                            gauge = flapGauge;
                            break;
                        case "FlapsSpeedbrakes":
                            gauge = document.createElement("glasscockpit-xmlflapsspeedbrakesgauge");
                            _element.appendChild(gauge);
                            break;
                        case "LongitudeFuel":
                            gauge = document.createElement("glasscockpit-xmllongitudefuelgauge");
                            _element.appendChild(gauge);
                            break;
                    }
                    if (gauge) {
                        let styleElem = gauges[i].getElementsByTagName("Style");
                        if (styleElem.length > 0) {
                            let sizePercentElem = styleElem[0].getElementsByTagName("SizePercent");
                            if (sizePercentElem.length > 0) {
                                gauge.sizePercent = parseFloat(sizePercentElem[0].textContent);
                            }
                        }
                        gauge.setStyle(styleElem.length > 0 ? styleElem[0] : null);
                        gauge.drawBase();
                        let minElem = gauges[i].getElementsByTagName("Minimum");
                        let maxElem = gauges[i].getElementsByTagName("Maximum");
                        if (minElem.length > 0 && maxElem.length > 0) {
                            gauge.setLimitCallbacks(new CompositeLogicXMLElement(this.gps, minElem[0]), new CompositeLogicXMLElement(this.gps, maxElem[0]), this.context);
                        }
                        let colorZones = gauges[i].getElementsByTagName("ColorZone");
                        for (let j = 0; j < colorZones.length; j++) {
                            let colorElem = colorZones[j].getElementsByTagName("Color");
                            let beginElem = colorZones[j].getElementsByTagName("Begin");
                            let endElem = colorZones[j].getElementsByTagName("End");
                            let smoothFactorElem = colorZones[j].getElementsByTagName("SmoothFactor");
                            let smoothFactor = smoothFactorElem.length > 0 ? parseFloat(smoothFactorElem[0].textContent) : null;
                            let color = colorElem.length > 0 ? colorElem[0].textContent : "white";
                            if (beginElem.length > 0 && endElem.length > 0) {
                                gauge.addColorZone(new CompositeLogicXMLElement(this.gps, beginElem[0]), new CompositeLogicXMLElement(this.gps, endElem[0]), color, this.context, smoothFactor);
                            }
                        }
                        let colorLines = gauges[i].getElementsByTagName("ColorLine");
                        for (let j = 0; j < colorLines.length; j++) {
                            let posElem = colorLines[j].getElementsByTagName("Position");
                            let colorElem = colorLines[j].getElementsByTagName("Color");
                            let smoothFactorElem = colorLines[j].getElementsByTagName("SmoothFactor");
                            let smoothFactor = smoothFactorElem.length > 0 ? parseFloat(smoothFactorElem[0].textContent) : null;
                            let color = colorElem.length > 0 ? colorElem[0].textContent : "white";
                            if (posElem.length > 0) {
                                gauge.addColorLine(new CompositeLogicXMLElement(this.gps, posElem[0]), color, this.context, smoothFactor);
                            }
                        }
                        let referenceBugs = gauges[i].getElementsByTagName("ReferenceBug");
                        for (let j = 0; j < referenceBugs.length; j++) {
                            let styleElem = referenceBugs[j].getElementsByTagName("Style");
                            let posElem = referenceBugs[j].getElementsByTagName("Position");
                            let displayLogicElements = referenceBugs[j].getElementsByTagName("DisplayLogic");
                            let smoothFactorElem = referenceBugs[j].getElementsByTagName("SmoothFactor");
                            let displayLogicElement;
                            if (displayLogicElements.length > 0) {
                                displayLogicElement = displayLogicElements[0];
                            }
                            else {
                                displayLogicElement = document.createElement("DisplayLogic");
                                displayLogicElement.textContent = "1";
                            }
                            let smoothFactor = smoothFactorElem.length > 0 ? parseFloat(smoothFactorElem[0].textContent) : null;
                            if (posElem.length > 0 && displayLogicElement) {
                                gauge.addReferenceBug(new CompositeLogicXMLElement(this.gps, posElem[0]), new CompositeLogicXMLElement(this.gps, displayLogicElement), (styleElem.length > 0) ? styleElem[0] : null, this.context, smoothFactor);
                            }
                        }
                        let valueElem = gauges[i].getElementsByTagName("Value");
                        if (valueElem.length > 0) {
                            gauge.valueCallback = new CompositeLogicXMLElement(this.gps, valueElem[0]);
                        }
                        let value2Elem = gauges[i].getElementsByTagName("Value2");
                        if (value2Elem.length > 0) {
                            gauge.value2Callback = new CompositeLogicXMLElement(this.gps, value2Elem[0]);
                        }
                        let title = "";
                        let unit = "";
                        let titleElem = gauges[i].getElementsByTagName("Title");
                        if (titleElem.length > 0) {
                            title = titleElem[0].textContent;
                        }
                        let unitElem = gauges[i].getElementsByTagName("Unit");
                        if (unitElem.length > 0) {
                            unit = unitElem[0].textContent;
                        }
                        gauge.setTitleAndUnit(title, unit);
                        let graduationElem = gauges[i].getElementsByTagName("GraduationLength");
                        if (graduationElem.length > 0) {
                            gauge.setGraduations(parseFloat(graduationElem[0].textContent), graduationElem[0].getAttribute("text") == "True" ? true : false);
                        }
                        let beginTextElem = gauges[i].getElementsByTagName("BeginText");
                        if (beginTextElem.length > 0) {
                            gauge.forceBeginText(beginTextElem[0].textContent);
                        }
                        let endTextElem = gauges[i].getElementsByTagName("EndText");
                        if (endTextElem.length > 0) {
                            gauge.forceEndText(endTextElem[0].textContent);
                        }
                        let cursorTextElem = gauges[i].getElementsByTagName("CursorText");
                        let cursorText2Elem = gauges[i].getElementsByTagName("CursorText2");
                        if (cursorTextElem.length > 0 || cursorText2Elem.length > 0) {
                            gauge.setCursorLabel(cursorTextElem.length > 0 ? cursorTextElem[0].textContent : "", cursorText2Elem.length > 0 ? cursorText2Elem[0].textContent : "");
                        }
                        let gaugeIdElem = gauges[i].getElementsByTagName("ID");
                        if (gaugeIdElem.length > 0) {
                            diffAndSetAttribute(gauge.rootSvg, "class", gaugeIdElem[0].textContent);
                        }
                        this.gauges.push(gauge);
                        let redBlinkElem = gauges[i].getElementsByTagName("RedBlink");
                        if (redBlinkElem.length > 0) {
                            gauge.redBlinkCallback = new CompositeLogicXMLElement(this.gps, redBlinkElem[0]);
                        }
                    }
                }
            }
            else if (gauges[i].tagName == "Text") {
                let textZone = document.createElement("glasscockpit-xmltextzone");
                diffAndSetAttribute(textZone, "class", gauges[i].getAttribute("id"));
                _element.appendChild(textZone);
                this.texts.push(textZone);
                let leftText = gauges[i].getElementsByTagName("Left");
                if (leftText.length > 0) {
                    let contentElem = leftText[0].getElementsByTagName("Content");
                    if (contentElem.length > 0) {
                        if (contentElem[0].children.length > 0) {
                            textZone.leftCallback = new CompositeLogicXMLElement(this.gps, contentElem[0]);
                        }
                        else {
                            textZone.setLeftText(contentElem[0].textContent);
                        }
                    }
                    else {
                        if (leftText[0].children.length > 0) {
                            textZone.leftCallback = new CompositeLogicXMLElement(this.gps, leftText[0]);
                        }
                        else {
                            textZone.setLeftText(leftText[0].textContent);
                        }
                    }
                    let colorElem = leftText[0].getElementsByTagName("Color");
                    if (colorElem.length > 0) {
                        textZone.leftColor = new CompositeLogicXMLElement(this.gps, colorElem[0]);
                    }
                    textZone.setLeftClass(leftText[0].getAttribute("id"));
                    let fontSize = leftText[0].getAttribute("fontsize");
                    if (fontSize != null && fontSize != "") {
                        textZone.setLeftFontSize(fontSize);
                    }
                }
                let centerText = gauges[i].getElementsByTagName("Center");
                if (centerText.length > 0) {
                    let contentElem = centerText[0].getElementsByTagName("Content");
                    if (contentElem.length > 0) {
                        if (contentElem[0].children.length > 0) {
                            textZone.centerCallback = new CompositeLogicXMLElement(this.gps, contentElem[0]);
                        }
                        else {
                            textZone.setCenterText(contentElem[0].textContent);
                        }
                    }
                    else {
                        if (centerText[0].children.length > 0) {
                            textZone.centerCallback = new CompositeLogicXMLElement(this.gps, centerText[0]);
                        }
                        else {
                            textZone.setCenterText(centerText[0].textContent);
                        }
                    }
                    let colorElem = centerText[0].getElementsByTagName("Color");
                    if (colorElem.length > 0) {
                        textZone.centerColor = new CompositeLogicXMLElement(this.gps, colorElem[0]);
                    }
                    textZone.setCenterClass(centerText[0].getAttribute("id"));
                    let fontSize = centerText[0].getAttribute("fontsize");
                    if (fontSize != null && fontSize != "") {
                        textZone.setCenterFontSize(fontSize);
                    }
                }
                let rightText = gauges[i].getElementsByTagName("Right");
                if (rightText.length > 0) {
                    let contentElem = rightText[0].getElementsByTagName("Content");
                    if (contentElem.length > 0) {
                        if (contentElem[0].children.length > 0) {
                            textZone.rightCallback = new CompositeLogicXMLElement(this.gps, contentElem[0]);
                        }
                        else {
                            textZone.setRightText(contentElem[0].textContent);
                        }
                    }
                    else {
                        if (rightText[0].children.length > 0) {
                            textZone.rightCallback = new CompositeLogicXMLElement(this.gps, rightText[0]);
                        }
                        else {
                            textZone.setRightText(rightText[0].textContent);
                        }
                    }
                    let colorElem = rightText[0].getElementsByTagName("Color");
                    if (colorElem.length > 0) {
                        textZone.rightColor = new CompositeLogicXMLElement(this.gps, colorElem[0]);
                    }
                    textZone.setRightClass(rightText[0].getAttribute("id"));
                    let fontSize = rightText[0].getAttribute("fontsize");
                    if (fontSize != null && fontSize != "") {
                        textZone.setRightFontSize(fontSize);
                    }
                }
            }
            else if (gauges[i].tagName == "ColumnsGroup") {
                let columns = gauges[i].children;
                let mainDiv = document.createElement("div");
                mainDiv.style.width = "100%";
                diffAndSetStyle(mainDiv, StyleProperty.display, "flex");
                diffAndSetAttribute(mainDiv, "class", gauges[i].getAttribute("id"));
                _element.appendChild(mainDiv);
                let unset = 0;
                let setSize = 0;
                for (let j = 0; j < columns.length; j++) {
                    let width = columns[j].getAttribute("width");
                    if (width) {
                        setSize += parseFloat(width);
                    }
                    else {
                        unset++;
                    }
                }
                for (let j = 0; j < columns.length; j++) {
                    let colDiv = document.createElement("div");
                    let width = columns[j].getAttribute("width");
                    if (width) {
                        colDiv.style.width = width + "%";
                    }
                    else {
                        colDiv.style.width = ((99 - setSize) / unset) + "%";
                    }
                    let colId = columns[j].getAttribute("id");
                    diffAndSetAttribute(colDiv, "class", "Column" + ((colId && colId != "") ? (" " + colId) : ""));
                    mainDiv.appendChild(colDiv);
                    this.parseElement(columns[j], colDiv);
                }
            }
            else if (gauges[i].tagName == "CAS") {
                this.CAS = new Cabin_Annunciations();
                this.CAS.setGPS(this.gps);
                let casDiv = document.createElement("div");
                diffAndSetAttribute(casDiv, "id", "Annunciations");
                _element.appendChild(casDiv);
                this.CAS.init(_element);
            }
            else if (gauges[i].tagName == "Function") {
                let func = new LogicXMLFunction();
                func.name = gauges[i].getAttribute("Name");
                func.callback = new CompositeLogicXMLElement(this.gps, gauges[i]);
                this.context.addFunction(func);
            }
        }
    }
    onSoundEnd(_eventId) {
        if (this.CAS) {
            this.CAS.onSoundEnd(_eventId);
        }
    }
    update(_deltaTime) {
        for (let i = 0; i < this.gauges.length; i++) {
            this.gauges[i].update(this.context, _deltaTime);
        }
        for (let i = 0; i < this.texts.length; i++) {
            this.texts[i].update(this.context);
        }
        if (this.CAS) {
            this.CAS.onUpdate(_deltaTime);
        }
        this.context.update();
    }
    onEvent(_event) {
        if (this.CAS) {
            this.CAS.onEvent(_event);
        }
    }
}
customElements.define('glasscockpit-xmlenginedisplay', XMLEngineDisplay);
class XMLTextZone extends HTMLElement {
    constructor() {
        super(...arguments);
        this.height = 15;
    }
    connectedCallback() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", "100%");
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 15");
        this.appendChild(this.rootSvg);
        this.leftText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.leftText, "y", "12.5");
        diffAndSetAttribute(this.leftText, "x", "10");
        diffAndSetAttribute(this.leftText, "fill", "white");
        diffAndSetAttribute(this.leftText, "font-size", "10");
        diffAndSetAttribute(this.leftText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.leftText, "text-anchor", "start");
        this.rootSvg.appendChild(this.leftText);
        this.centerText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.centerText, "y", "12.5");
        diffAndSetAttribute(this.centerText, "x", "50");
        diffAndSetAttribute(this.centerText, "fill", "white");
        diffAndSetAttribute(this.centerText, "font-size", "10");
        diffAndSetAttribute(this.centerText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.centerText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.centerText);
        this.rightText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.rightText, "y", "12.5");
        diffAndSetAttribute(this.rightText, "x", "90");
        diffAndSetAttribute(this.rightText, "fill", "white");
        diffAndSetAttribute(this.rightText, "font-size", "10");
        diffAndSetAttribute(this.rightText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.rightText, "text-anchor", "end");
        this.rootSvg.appendChild(this.rightText);
    }
    setLeftText(_value) {
        if (this.leftText.textContent != _value) {
            diffAndSetText(this.leftText, _value);
        }
    }
    setCenterText(_value) {
        if (this.centerText.textContent != _value) {
            diffAndSetText(this.centerText, _value);
        }
    }
    setRightText(_value) {
        if (this.rightText.textContent != _value) {
            diffAndSetText(this.rightText, _value);
        }
    }
    setLeftFontSize(_value) {
        diffAndSetAttribute(this.leftText, "font-size", _value);
        this.height = Math.max(this.height, parseInt(_value) + 5);
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 " + this.height);
        diffAndSetAttribute(this.leftText, "y", (parseInt(_value) + 2.5) + '');
    }
    setCenterFontSize(_value) {
        diffAndSetAttribute(this.centerText, "font-size", _value);
        this.height = Math.max(this.height, parseInt(_value) + 5);
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 " + this.height);
        diffAndSetAttribute(this.centerText, "y", (parseInt(_value) + 2.5) + '');
    }
    setRightFontSize(_value) {
        diffAndSetAttribute(this.rightText, "font-size", _value);
        this.height = Math.max(this.height, parseInt(_value) + 5);
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 " + this.height);
        diffAndSetAttribute(this.rightText, "y", (parseInt(_value) + 2.5) + '');
    }
    setLeftClass(_value) {
        diffAndSetAttribute(this.leftText, "class", _value);
    }
    setCenterClass(_value) {
        diffAndSetAttribute(this.centerText, "class", _value);
    }
    setRightClass(_value) {
        diffAndSetAttribute(this.rightText, "class", _value);
    }
    update(_context) {
        if (this.leftCallback) {
            this.setLeftText(this.leftCallback.getValueAsString(_context));
        }
        if (this.centerCallback) {
            this.setCenterText(this.centerCallback.getValueAsString(_context));
        }
        if (this.rightCallback) {
            this.setRightText(this.rightCallback.getValueAsString(_context));
        }
        if (this.leftColor) {
            diffAndSetAttribute(this.leftText, "fill", this.leftColor.getValueAsString(_context));
        }
        if (this.centerColor) {
            diffAndSetAttribute(this.centerText, "fill", this.centerColor.getValueAsString(_context));
        }
        if (this.rightColor) {
            diffAndSetAttribute(this.rightText, "fill", this.rightColor.getValueAsString(_context));
        }
    }
}
customElements.define('glasscockpit-xmltextzone', XMLTextZone);
class XMLGauge extends HTMLElement {
    constructor() {
        super(...arguments);
        this.forcedBeginText = null;
        this.forcedEndText = null;
        this.isAlerting = false;
        this.valueTextLength = 0;
        this.sizePercent = 100;
        this.colorZones = [];
        this.colorLines = [];
        this.referenceBugs = [];
    }
    setLimitCallbacks(_begin, _end, _context) {
        this.minValueCallback = _begin;
        this.maxValueCallback = _end;
        this.setLimitValues(_begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    setLimitValues(_begin, _end) {
        this.minValue = _begin;
        this.maxValue = _end;
        for (let i = 0; i < this.colorZones.length; i++) {
            this.updateColorZone(this.colorZones[i].element, this.colorZones[i].lastBegin, this.colorZones[i].lastEnd);
        }
        for (let i = 0; i < this.colorLines.length; i++) {
            this.updateColorLine(this.colorLines[i].element, this.colorLines[i].lastPos);
        }
    }
    update(_context, _deltaTime) {
        let min = this.minValueCallback.getValueAsNumber(_context);
        let max = this.maxValueCallback.getValueAsNumber(_context);
        if (min != this.minValue || max != this.maxValue) {
            this.setLimitValues(min, max);
        }
        this.updateValue(this.valueCallback.getValueAsNumber(_context), this.value2Callback ? this.value2Callback.getValueAsNumber() : null);
        for (let i = 0; i < this.colorZones.length; i++) {
            let begin = this.colorZones[i].beginXmlCallback.getValueAsNumber(_context);
            let end = this.colorZones[i].endXmlCallback.getValueAsNumber(_context);
            if (begin != this.colorZones[i].lastBegin || end != this.colorZones[i].lastEnd) {
                if (!isNaN(this.colorZones[i].smoothFactor) && !isNaN(this.colorZones[i].lastBegin) && !isNaN(this.colorZones[i].lastEnd)) {
                    begin = Utils.SmoothLinear(this.colorZones[i].lastBegin, begin, this.colorZones[i].smoothFactor, _deltaTime);
                    end = Utils.SmoothLinear(this.colorZones[i].lastEnd, end, this.colorZones[i].smoothFactor, _deltaTime);
                }
                this.updateColorZone(this.colorZones[i].element, begin, end);
                this.colorZones[i].lastBegin = begin;
                this.colorZones[i].lastEnd = end;
            }
        }
        for (let i = 0; i < this.colorLines.length; i++) {
            let pos = this.colorLines[i].posXmlCallback.getValueAsNumber(_context);
            if (pos != this.colorLines[i].lastPos) {
                if (!isNaN(this.colorLines[i].smoothFactor) && !isNaN(this.colorLines[i].lastPos)) {
                    pos = Utils.SmoothLinear(this.colorLines[i].lastPos, pos, this.colorLines[i].smoothFactor, _deltaTime);
                }
                this.updateColorLine(this.colorLines[i].element, pos);
                this.colorLines[i].lastPos = pos;
            }
        }
        for (let i = 0; i < this.referenceBugs.length; i++) {
            let pos = this.referenceBugs[i].posXmlCallback.getValueAsNumber(_context);
            let displayed = (this.referenceBugs[i].displayLogicCallback.getValueAsNumber(_context) != 0);
            if (pos != this.referenceBugs[i].lastPos || displayed != this.referenceBugs[i].lastDisplayed) {
                if (!isNaN(this.referenceBugs[i].smoothFactor) && !isNaN(this.referenceBugs[i].lastPos)) {
                    pos = Utils.SmoothLinear(this.referenceBugs[i].lastPos, pos, this.referenceBugs[i].smoothFactor, _deltaTime);
                }
                this.updateReferenceBug(this.referenceBugs[i].element, pos, displayed);
                this.referenceBugs[i].lastPos = pos;
                this.referenceBugs[i].lastDisplayed = displayed;
            }
        }
        if (this.redBlinkCallback) {
            let newValue = this.redBlinkCallback.getValue(_context);
            if (newValue != 0 && !this.isAlerting) {
                this.isAlerting = true;
                this.computeAlertBackgrounds();
                diffAndSetAttribute(this, "State", "Alert");
            }
            else if (this.isAlerting && newValue == 0) {
                this.isAlerting = false;
                diffAndSetAttribute(this, "State", "");
            }
        }
    }
}
class XMLGaugeColorZone {
    constructor(_element, _begin, _end, _smoothFactor) {
        this.lastBegin = 0;
        this.lastEnd = 0;
        this.smoothFactor = NaN;
        this.element = _element;
        this.beginXmlCallback = _begin;
        this.endXmlCallback = _end;
        if (_smoothFactor && !isNaN(_smoothFactor)) {
            this.smoothFactor = _smoothFactor;
        }
    }
}
class XMLGaugeColorLine {
    constructor(_element, _pos, _smoothFactor) {
        this.lastPos = NaN;
        this.smoothFactor = NaN;
        this.element = _element;
        this.posXmlCallback = _pos;
        if (_smoothFactor && !isNaN(_smoothFactor)) {
            this.smoothFactor = _smoothFactor;
        }
    }
}
class XMLGaugeReferenceBug {
    constructor(_element, _pos, _displayLogic, _smoothFactor) {
        this.lastPos = NaN;
        this.lastDisplayed = false;
        this.smoothFactor = NaN;
        this.element = _element;
        this.posXmlCallback = _pos;
        this.displayLogicCallback = _displayLogic;
        if (_smoothFactor && !isNaN(_smoothFactor)) {
            this.smoothFactor = _smoothFactor;
        }
    }
}
class XMLCircularGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.startAngle = -15;
        this.endAngle = 195;
        this.cursorType = 0;
        this.valuePos = 0;
        this.height = 63;
        this.textIncrement = 1;
        this.fontSize = 10;
        this.forceTextColor = "";
    }
    setStyle(_styleElem) {
        if (_styleElem) {
            let forceTextColorElem = _styleElem.getElementsByTagName("ForceTextColor");
            if (forceTextColorElem.length > 0) {
                this.forceTextColor = forceTextColorElem[0].textContent;
            }
            let textIncrementElem = _styleElem.getElementsByTagName("TextIncrement");
            if (textIncrementElem.length > 0) {
                this.textIncrement = parseInt(textIncrementElem[0].textContent);
            }
            let startElem = _styleElem.getElementsByTagName("BeginAngle");
            if (startElem.length > 0) {
                this.startAngle = parseFloat(startElem[0].textContent);
            }
            let endElem = _styleElem.getElementsByTagName("EndAngle");
            if (endElem.length > 0) {
                this.endAngle = parseFloat(endElem[0].textContent);
            }
            let cursorElem = _styleElem.getElementsByTagName("CursorType");
            if (cursorElem.length > 0) {
                switch (cursorElem[0].textContent) {
                    case "Triangle":
                        this.cursorType = 1;
                        break;
                }
            }
            let valuePosElem = _styleElem.getElementsByTagName("ValuePos");
            if (valuePosElem.length > 0) {
                switch (valuePosElem[0].textContent) {
                    case "End":
                        this.valuePos = 1;
                        break;
                }
            }
            let fontSizeElem = _styleElem.getElementsByTagName("FontSize");
            if (fontSizeElem.length > 0) {
                this.fontSize = parseFloat(fontSizeElem[0].textContent);
            }
            this.height = Math.max(40 - 40 * Math.sin(this.startAngle * Math.PI / 180), 40 - 40 * Math.sin(this.endAngle * Math.PI / 180) + (this.valuePos == 1 ? 20 : 0), (this.valuePos == 1 ? 50 : 60)) + 3;
        }
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 -2 100 " + this.height);
        this.appendChild(this.rootSvg);
        this.decorationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.decorationGroup);
        this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationGroup);
        let mainArc = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(mainArc, "d", "M" + (50 - 40 * Math.cos(this.startAngle * Math.PI / 180)) + " " + (40 - 40 * Math.sin(this.startAngle * Math.PI / 180)) + "A 40 40 0 " + (this.endAngle - this.startAngle > 180 ? "1" : "0") + " 1" + (50 - 40 * Math.cos(this.endAngle * Math.PI / 180)) + " " + (40 - 40 * Math.sin(this.endAngle * Math.PI / 180)));
        diffAndSetAttribute(mainArc, "stroke", "white");
        diffAndSetAttribute(mainArc, "stroke-width", "2");
        diffAndSetAttribute(mainArc, "fill", "none");
        this.rootSvg.appendChild(mainArc);
        let beginLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(beginLimit, "x", "10");
        diffAndSetAttribute(beginLimit, "y", "39");
        diffAndSetAttribute(beginLimit, "width", "10");
        diffAndSetAttribute(beginLimit, "height", "2");
        diffAndSetAttribute(beginLimit, "fill", "white");
        diffAndSetAttribute(beginLimit, "transform", "rotate(" + this.startAngle + " 50 40)");
        this.rootSvg.appendChild(beginLimit);
        let endLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(endLimit, "x", "10");
        diffAndSetAttribute(endLimit, "y", "39");
        diffAndSetAttribute(endLimit, "width", "10");
        diffAndSetAttribute(endLimit, "height", "2");
        diffAndSetAttribute(endLimit, "fill", "white");
        diffAndSetAttribute(endLimit, "transform", "rotate(" + this.endAngle + " 50 40)");
        this.rootSvg.appendChild(endLimit);
        this.cursor = document.createElementNS(Avionics.SVG.NS, "polygon");
        switch (this.cursorType) {
            case 0:
                diffAndSetAttribute(this.cursor, "points", "15,40, 22,36 24,38.5 40,38.5 40,41.5 24,41.5 22,44");
                diffAndSetAttribute(this.cursor, "stroke", "#1a1d21");
                diffAndSetAttribute(this.cursor, "stroke_width", "0.1");
                break;
            case 1:
                diffAndSetAttribute(this.cursor, "points", "15,40, 25,35 25,45");
                break;
        }
        diffAndSetAttribute(this.cursor, "fill", "white");
        this.rootSvg.appendChild(this.cursor);
        this.beginText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.beginText, "x", (50 - 40 * Math.cos((this.startAngle - 15) * Math.PI / 180)) + '');
        diffAndSetAttribute(this.beginText, "y", (40 - 40 * Math.sin((this.startAngle - 15) * Math.PI / 180)) + '');
        diffAndSetAttribute(this.beginText, "fill", "white");
        diffAndSetAttribute(this.beginText, "font-size", "8");
        diffAndSetAttribute(this.beginText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.beginText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.beginText);
        this.endText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.endText, "x", (50 - 40 * Math.cos((this.endAngle + 15) * Math.PI / 180)) + '');
        diffAndSetAttribute(this.endText, "y", (40 - 40 * Math.sin((this.endAngle + 15) * Math.PI / 180)) + '');
        diffAndSetAttribute(this.endText, "fill", "white");
        diffAndSetAttribute(this.endText, "font-size", "8");
        diffAndSetAttribute(this.endText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.endText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.endText);
        this.titleText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.titleText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.titleText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.titleText_alertbg);
        this.unitText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.unitText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.unitText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.unitText_alertbg);
        this.valueText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.valueText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.valueText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.valueText_alertbg);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.titleText, "x", "50");
        diffAndSetAttribute(this.titleText, "y", (20 + this.fontSize).toFixed(0));
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", this.fontSize.toFixed(0));
        diffAndSetAttribute(this.titleText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.titleText, "text-anchor", "middle");
        diffAndSetAttribute(this.titleText, "AlertBlink", "Text");
        this.rootSvg.appendChild(this.titleText);
        this.unitText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.unitText, "x", "50");
        diffAndSetAttribute(this.unitText, "y", (35 + this.fontSize).toFixed(0));
        diffAndSetAttribute(this.unitText, "fill", "white");
        diffAndSetAttribute(this.unitText, "font-size", this.fontSize.toFixed(0));
        diffAndSetAttribute(this.unitText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.unitText, "text-anchor", "middle");
        diffAndSetAttribute(this.unitText, "AlertBlink", "Text");
        this.rootSvg.appendChild(this.unitText);
        this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
        switch (this.valuePos) {
            case 0:
                diffAndSetAttribute(this.valueText, "x", "50");
                diffAndSetAttribute(this.valueText, "y", "60");
                diffAndSetAttribute(this.valueText, "text-anchor", "middle");
                diffAndSetAttribute(this.valueText, "font-size", "15");
                break;
            case 1:
                diffAndSetAttribute(this.valueText, "x", (60 - 40 * Math.cos((this.endAngle + 25) * Math.PI / 180)) + '');
                diffAndSetAttribute(this.valueText, "y", (40 - 40 * Math.sin((this.endAngle + 25) * Math.PI / 180)) + '');
                diffAndSetAttribute(this.valueText, "text-anchor", "end");
                diffAndSetAttribute(this.valueText, "font-size", (this.fontSize * 1.3).toFixed(0));
                break;
        }
        diffAndSetAttribute(this.valueText, "fill", "white");
        diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.valueText, "AlertBlink", "Text");
        this.rootSvg.appendChild(this.valueText);
    }
    addColorZone(_begin, _end, _color, _context, _smoothFactor) {
        let colorZone = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(colorZone, "d", "");
        diffAndSetAttribute(colorZone, "fill", _color);
        this.decorationGroup.appendChild(colorZone);
        this.colorZones.push(new XMLGaugeColorZone(colorZone, _begin, _end, _smoothFactor));
        this.updateColorZone(colorZone, _begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    updateColorZone(_element, _begin, _end) {
        let beginAngle = this.valueToAngle(_begin);
        let endAngle = this.valueToAngle(_end);
        let longPath = endAngle - beginAngle > 180;
        let path = "M" + (50 - 38 * Math.cos(beginAngle * Math.PI / 180)) + " " + (40 - 38 * Math.sin(beginAngle * Math.PI / 180)) + "A 38 38 0 " + (longPath ? "1" : "0") + " 1" + (50 - 38 * Math.cos(endAngle * Math.PI / 180)) + " " + (40 - 38 * Math.sin(endAngle * Math.PI / 180));
        path += "L" + (50 - 34 * Math.cos(endAngle * Math.PI / 180)) + " " + (40 - 34 * Math.sin(endAngle * Math.PI / 180)) + "A 34 34 0 " + (longPath ? "1" : "0") + " 0" + (50 - 34 * Math.cos(beginAngle * Math.PI / 180)) + " " + (40 - 34 * Math.sin(beginAngle * Math.PI / 180));
        diffAndSetAttribute(_element, "d", path);
    }
    addColorLine(_position, _color, _context, _smoothFactor) {
        let colorLine = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorLine, "x", "10");
        diffAndSetAttribute(colorLine, "y", "39");
        diffAndSetAttribute(colorLine, "height", "2");
        diffAndSetAttribute(colorLine, "width", "10");
        diffAndSetAttribute(colorLine, "fill", _color);
        this.decorationGroup.appendChild(colorLine);
        this.colorLines.push(new XMLGaugeColorLine(colorLine, _position, _smoothFactor));
        this.updateColorLine(colorLine, _position.getValueAsNumber(_context));
    }
    updateColorLine(_element, _pos) {
        let angle = this.valueToAngle(_pos);
        if (angle >= this.startAngle && angle <= this.endAngle) {
            diffAndSetAttribute(_element, "transform", "rotate(" + angle + " 50 40)");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        let color = "white";
        if (_styleElem) {
            let colorElem = _styleElem.getElementsByTagName("Color");
            if (colorElem.length > 0) {
                color = colorElem[0].textContent;
            }
        }
        let referenceBug = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(referenceBug, "d", "M 16 40 v-7 h5 v5 l-2 2 l2 2 v5 h-5Z");
        diffAndSetAttribute(referenceBug, "fill", color);
        this.decorationGroup.appendChild(referenceBug);
        this.referenceBugs.push(new XMLGaugeReferenceBug(referenceBug, _position, _displayed, _smoothFactor));
        this.updateReferenceBug(referenceBug, _position.getValueAsNumber(_context), (_displayed.getValueAsNumber(_context) != 0));
    }
    updateReferenceBug(_element, _pos, _displayed) {
        let angle = this.valueToAngle(_pos);
        if (angle >= this.startAngle && angle <= this.endAngle && _displayed) {
            diffAndSetAttribute(_element, "transform", "rotate(" + angle + " 50 40)");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    updateValue(_value) {
        if (_value != this.lastValue) {
            diffAndSetAttribute(this.cursor, "transform", "rotate(" + this.valueToAngle(Math.max(Math.min(_value, this.maxValue), this.minValue)) + " 50 40)");
            let text = this.textIncrement != 1 ? fastToFixed(Math.round(_value / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value, 0);
            ;
            diffAndSetText(this.valueText, text);
            this.lastValue = _value;
            if (this.forceTextColor == "") {
                let colorFound = false;
                for (let i = this.colorZones.length - 1; i >= 0; i--) {
                    if (_value >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                        diffAndSetAttribute(this.valueText, "fill", this.colorZones[i].element.getAttribute("fill"));
                        colorFound = true;
                        break;
                    }
                }
                if (!colorFound) {
                    diffAndSetAttribute(this.valueText, "fill", "white");
                }
            }
            else {
                diffAndSetAttribute(this.valueText, "fill", this.forceTextColor);
            }
            if (this.valueText_alertbg) {
                if (this.valueTextLength != text.length) {
                    this.valueTextLength = text.length;
                    let valueBbox = this.valueText.getBBox();
                    diffAndSetAttribute(this.valueText_alertbg, "x", (valueBbox.x - 1) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "y", (valueBbox.y - 1) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "width", (valueBbox.width + 2) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "height", (valueBbox.height + 2) + '');
                }
            }
        }
    }
    valueToAngle(_value) {
        return ((_value - this.minValue) / (this.maxValue - this.minValue)) * (this.endAngle - this.startAngle) + this.startAngle;
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        if (this.forcedBeginText == null) {
            diffAndSetText(this.beginText, _begin + '');
        }
        if (this.forcedEndText == null) {
            diffAndSetText(this.endText, _end + '');
        }
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title);
        diffAndSetText(this.unitText, _unit);
    }
    computeAlertBackgrounds() {
        let titleBbox = this.titleText.getBBox();
        diffAndSetAttribute(this.titleText_alertbg, "x", (titleBbox.x - 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "y", (titleBbox.y - 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "width", (titleBbox.width + 2) + '');
        diffAndSetAttribute(this.titleText_alertbg, "height", (titleBbox.height + 2) + '');
        let unitBbox = this.unitText.getBBox();
        diffAndSetAttribute(this.unitText_alertbg, "x", (unitBbox.x - 1) + '');
        diffAndSetAttribute(this.unitText_alertbg, "y", (unitBbox.y - 1) + '');
        diffAndSetAttribute(this.unitText_alertbg, "width", (unitBbox.width + 2) + '');
        diffAndSetAttribute(this.unitText_alertbg, "height", (unitBbox.height + 2) + '');
    }
    setGraduations(_spaceBetween, _withText = false) {
        for (let i = this.minValue + _spaceBetween; i < this.maxValue; i += _spaceBetween) {
            let grad = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(grad, "x", "10");
            diffAndSetAttribute(grad, "y", "39");
            diffAndSetAttribute(grad, "width", "6");
            diffAndSetAttribute(grad, "height", "1");
            diffAndSetAttribute(grad, "fill", "white");
            diffAndSetAttribute(grad, "transform", "rotate(" + this.valueToAngle(i) + " 50 40)");
            this.graduationGroup.appendChild(grad);
        }
    }
    forceBeginText(_text) {
        diffAndSetText(this.beginText, _text);
        this.forcedBeginText = _text;
    }
    forceEndText(_text) {
        diffAndSetText(this.endText, _text);
        this.forcedEndText = _text;
    }
    setCursorLabel(_label1, _label2) {
    }
}
customElements.define('glasscockpit-xmlcirculargauge', XMLCircularGauge);
class XMLHorizontalGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.valuePos = 0;
        this.beginX = 10;
        this.endX = 90;
        this.width = 100;
        this.cursorColor = "white";
        this.cursorStyle = 0;
        this.isReverseY = false;
        this.textIncrement = 1;
        this.textPrecision = 0;
        this.strokeWidth = 2;
        this.fontSize = 10;
    }
    setStyle(_styleElem) {
        if (_styleElem) {
            let textIncrementElem = _styleElem.getElementsByTagName("TextIncrement");
            if (textIncrementElem.length > 0) {
                this.textIncrement = parseInt(textIncrementElem[0].textContent);
            }
            let valuePosElem = _styleElem.getElementsByTagName("ValuePos");
            if (valuePosElem.length > 0) {
                switch (valuePosElem[0].textContent) {
                    case "End":
                        this.valuePos = 1;
                        break;
                    case "Right":
                        this.valuePos = 2;
                        this.endX = 70;
                }
            }
            let cursorColorElem = _styleElem.getElementsByTagName("CursorColor");
            if (cursorColorElem.length > 0) {
                this.cursorColor = cursorColorElem[0].textContent;
            }
            let cursorStyleElem = _styleElem.getElementsByTagName("CursorStyle");
            if (cursorStyleElem.length > 0) {
                switch (cursorStyleElem[0].textContent) {
                    case "Cursor":
                        this.cursorStyle = 0;
                        break;
                    case "Fill":
                        this.cursorStyle = 1;
                        break;
                }
            }
            let widthElem = _styleElem.getElementsByTagName("Width");
            if (widthElem.length > 0) {
                this.width = parseFloat(widthElem[0].textContent);
                this.beginX = this.beginX / (100 / this.width);
                this.endX = this.endX / (100 / this.width);
            }
            let reverseYElem = _styleElem.getElementsByTagName("ReverseY");
            if (reverseYElem.length > 0) {
                this.isReverseY = reverseYElem[0].textContent == "True";
            }
            let precisionElem = _styleElem.getElementsByTagName("ValuePrecision");
            if (precisionElem.length > 0) {
                this.textPrecision = parseInt(precisionElem[0].textContent);
            }
            let fontSizeElem = _styleElem.getElementsByTagName("FontSize");
            if (fontSizeElem.length > 0) {
                this.fontSize = parseFloat(fontSizeElem[0].textContent);
            }
            let strokeWidthElem = _styleElem.getElementsByTagName("StrokeWidth");
            if (strokeWidthElem.length > 0) {
                this.strokeWidth = parseFloat(strokeWidthElem[0].textContent);
            }
        }
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        if (this.valuePos == 2) {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 10 " + this.width + " 12");
        }
        else {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 " + this.width + " 30");
        }
        this.appendChild(this.rootSvg);
        this.decorationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.decorationGroup);
        this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationGroup);
        let bottomBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(bottomBar, "x", this.beginX + '');
        diffAndSetAttribute(bottomBar, "y", this.isReverseY ? "2" : "20");
        diffAndSetAttribute(bottomBar, "height", this.strokeWidth.toFixed(1));
        diffAndSetAttribute(bottomBar, "width", (this.endX - this.beginX) + '');
        diffAndSetAttribute(bottomBar, "fill", "white");
        this.rootSvg.appendChild(bottomBar);
        let beginLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(beginLimit, "x", (this.beginX - 1) + '');
        diffAndSetAttribute(beginLimit, "y", this.isReverseY ? "2" : "14");
        diffAndSetAttribute(beginLimit, "height", (6 + this.strokeWidth).toFixed(1));
        diffAndSetAttribute(beginLimit, "width", this.strokeWidth.toFixed(1));
        diffAndSetAttribute(beginLimit, "fill", "white");
        this.rootSvg.appendChild(beginLimit);
        let endLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(endLimit, "x", (this.endX - 1) + '');
        diffAndSetAttribute(endLimit, "y", this.isReverseY ? "2" : "14");
        diffAndSetAttribute(endLimit, "height", (6 + this.strokeWidth).toFixed(1));
        diffAndSetAttribute(endLimit, "width", this.strokeWidth.toFixed(1));
        diffAndSetAttribute(endLimit, "fill", "white");
        this.rootSvg.appendChild(endLimit);
        if (this.cursorStyle === 0) {
          this.cursor = document.createElementNS(Avionics.SVG.NS, "polygon");
          if (this.isReverseY) {
              diffAndSetAttribute(this.cursor, "points", this.beginX + ",2 " + (this.beginX - 3) + ",5 " + (this.beginX - 3) + ",10 " + (this.beginX + 3) + ",10 " + (this.beginX + 3) + ",5");
          }
          else {
              diffAndSetAttribute(this.cursor, "points", this.beginX + ",20 " + (this.beginX - 3) + ",17 " + (this.beginX - 3) + ",12 " + (this.beginX + 3) + ",12 " + (this.beginX + 3) + ",17");
          }
          diffAndSetAttribute(this.cursor, "fill", this.cursorColor);
          diffAndSetAttribute(this.cursor, "AlertBlink", "Red");
          this.rootSvg.appendChild(this.cursor);
      }
      else if (this.cursorStyle === 1) {
          this.cursor = document.createElementNS(Avionics.SVG.NS, "rect");
          this.cursor.setAttribute("x", this.beginX.toFixed(0));
          this.cursor.setAttribute("y", "14");
          this.cursor.setAttribute("height", "6");
          this.cursor.setAttribute("width", "100");
          diffAndSetAttribute(this.cursor, "fill", this.cursorColor);
          this.rootSvg.appendChild(this.cursor);
      }
        this.beginText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.beginText, "x", this.beginX + '');
        diffAndSetAttribute(this.beginText, "y", this.isReverseY ? "20" : "30");
        diffAndSetAttribute(this.beginText, "fill", "white");
        diffAndSetAttribute(this.beginText, "font-size", "8");
        diffAndSetAttribute(this.beginText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.beginText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.beginText);
        this.endText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.endText, "x", this.endX + '');
        diffAndSetAttribute(this.endText, "y", this.isReverseY ? "20" : "30");
        diffAndSetAttribute(this.endText, "fill", "white");
        diffAndSetAttribute(this.endText, "font-size", "8");
        diffAndSetAttribute(this.endText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.endText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.endText);
        this.titleText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.titleText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.titleText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.titleText_alertbg);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        if (this.valuePos == 1) {
            diffAndSetAttribute(this.titleText, "x", this.beginX + '');
            diffAndSetAttribute(this.titleText, "text-anchor", "start");
        }
        else {
            diffAndSetAttribute(this.titleText, "x", ((this.endX - this.beginX) / 2 + this.beginX) + '');
            diffAndSetAttribute(this.titleText, "text-anchor", "middle");
        }
        diffAndSetAttribute(this.titleText, "y", this.isReverseY ? "30" : "10");
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", "10");
        diffAndSetAttribute(this.titleText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.titleText, "AlertBlink", "Text");
        this.rootSvg.appendChild(this.titleText);
        this.valueText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.valueText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.valueText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.valueText_alertbg);
        switch (this.valuePos) {
            case 1:
                this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.valueText, "x", (this.endX + 5) + '');
                diffAndSetAttribute(this.valueText, "y", this.isReverseY ? "20" : "10");
                diffAndSetAttribute(this.valueText, "fill", "white");
                diffAndSetAttribute(this.valueText, "font-size", (this.fontSize * 1.2).toFixed(0));
                diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(this.valueText, "text-anchor", "end");
                diffAndSetAttribute(this.valueText, "AlertBlink", "Text");
                this.rootSvg.appendChild(this.valueText);
                break;
            case 2:
                this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.valueText, "x", (this.endX + 5) + '');
                diffAndSetAttribute(this.valueText, "y", this.isReverseY ? "20" : "20");
                diffAndSetAttribute(this.valueText, "fill", "white");
                diffAndSetAttribute(this.valueText, "font-size", (this.fontSize * 1.2).toFixed(0));
                diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(this.valueText, "text-anchor", "start");
                diffAndSetAttribute(this.valueText, "AlertBlink", "Text");
                this.rootSvg.appendChild(this.valueText);
                break;
        }
    }
    addColorZone(_begin, _end, _color, _context, _smoothFactor) {
        let colorZone = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorZone, "height", "4");
        diffAndSetAttribute(colorZone, "y", this.isReverseY ? "4" : "16");
        diffAndSetAttribute(colorZone, "fill", _color);
        this.decorationGroup.appendChild(colorZone);
        this.colorZones.push(new XMLGaugeColorZone(colorZone, _begin, _end, _smoothFactor));
        this.updateColorZone(colorZone, _begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    updateColorZone(_element, _begin, _end) {
        let begin = ((_begin - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX;
        let end = ((_end - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX;
        diffAndSetAttribute(_element, "x", begin.toFixed(0));
        diffAndSetAttribute(_element, "width", (Math.max(1, end - begin)).toFixed(0));
    }
    addColorLine(_position, _color, _context, _smoothFactor) {
        let colorLine = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorLine, "x", "9");
        diffAndSetAttribute(colorLine, "y", this.isReverseY ? "4" : "10");
        diffAndSetAttribute(colorLine, "height", "10");
        diffAndSetAttribute(colorLine, "width", "2");
        diffAndSetAttribute(colorLine, "fill", _color);
        this.decorationGroup.appendChild(colorLine);
        this.colorLines.push(new XMLGaugeColorLine(colorLine, _position, _smoothFactor));
        this.updateColorLine(colorLine, _position.getValueAsNumber(_context));
    }
    updateColorLine(_element, _pos) {
        if (_pos >= this.minValue && _pos <= this.maxValue) {
            diffAndSetAttribute(_element, "transform", "translate(" + (((_pos - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX)) + " 0)");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLHorizontalGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    setGraduations(_spaceBetween, _withText = false) {
        for (let i = this.minValue + _spaceBetween; i < this.maxValue; i += _spaceBetween) {
            let grad = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(grad, "x", (((i - this.minValue) / (this.maxValue - this.minValue)) * 80 + 9.5) + '');
            diffAndSetAttribute(grad, "y", this.isReverseY ? "4" : "14");
            diffAndSetAttribute(grad, "height", "6");
            diffAndSetAttribute(grad, "width", "1");
            diffAndSetAttribute(grad, "fill", "white");
            this.graduationGroup.appendChild(grad);
        }
    }
    updateValue(_value, _value2) {
        if (_value != this.lastValue) {
            let translate = (((Math.max(Math.min(_value, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX));
            if (this.cursorStyle === 0) {
              diffAndSetAttribute(this.cursor, "transform", "translate(" + translate + " 0)");
            }
            else if (this.cursorStyle === 1) {
                this.cursor.setAttribute("width", translate.toFixed(0));
            }
            if (this.cursorLabel) {
                diffAndSetAttribute(this.cursorLabel, "transform", "translate(" + translate + " 0)");
            }
            this.lastValue = _value;
            if (this.valueText) {
                let text = this.textIncrement != 1 ? fastToFixed((Math.round(_value / this.textIncrement) * this.textIncrement), this.textPrecision) : fastToFixed(_value, this.textPrecision);
                diffAndSetText(this.valueText, text);
                let colorFound = false;
                for (let i = this.colorZones.length - 1; i >= 0; i--) {
                    if (_value >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                        diffAndSetAttribute(this.valueText, "fill", this.colorZones[i].element.getAttribute("fill"));
                        colorFound = true;
                        break;
                    }
                }
                if (!colorFound) {
                    diffAndSetAttribute(this.valueText, "fill", "white");
                }
                if (this.valueText_alertbg) {
                    if (this.valueTextLength != text.length) {
                        this.valueTextLength = text.length;
                        let valueBbox = this.valueText.getBBox();
                        diffAndSetAttribute(this.valueText_alertbg, "x", (valueBbox.x - 1) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "y", (valueBbox.y - 1) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "width", (valueBbox.width + 2) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "height", (valueBbox.height + 2) + '');
                    }
                }
            }
        }
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title + " " + _unit);
    }
    computeAlertBackgrounds() {
        let titleBbox = this.titleText.getBBox();
        diffAndSetAttribute(this.titleText_alertbg, "x", (titleBbox.x - 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "y", (titleBbox.y - 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "width", (titleBbox.width + 2) + '');
        diffAndSetAttribute(this.titleText_alertbg, "height", (titleBbox.height + 2) + '');
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        if (this.forcedBeginText == null) {
            diffAndSetText(this.beginText, _begin + '');
        }
        if (this.forcedEndText == null) {
            diffAndSetText(this.endText, _end + '');
        }
    }
    forceBeginText(_text) {
        diffAndSetText(this.beginText, _text);
        this.forcedBeginText = _text;
    }
    forceEndText(_text) {
        diffAndSetText(this.endText, _text);
        this.forcedEndText = _text;
    }
    setCursorLabel(_label1, _label2) {
        if (!this.cursorLabel) {
            this.cursorLabel = document.createElementNS(Avionics.SVG.NS, "text");
            diffAndSetAttribute(this.cursorLabel, "x", "10");
            diffAndSetAttribute(this.cursorLabel, "y", this.isReverseY ? "9" : "19");
            diffAndSetAttribute(this.cursorLabel, "fill", "black");
            diffAndSetAttribute(this.cursorLabel, "font-size", "8");
            diffAndSetAttribute(this.cursorLabel, "font-family", "Roboto-Bold");
            diffAndSetAttribute(this.cursorLabel, "text-anchor", "middle");
            this.rootSvg.appendChild(this.cursorLabel);
        }
        diffAndSetText(this.cursorLabel, _label1);
    }
}
customElements.define('glasscockpit-xmlhorizontalgauge', XMLHorizontalGauge);
class XMLHorizontalDoubleGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.beginX = 10;
        this.endX = 90;
        this.valuePos = 0;
        this.textIncrement = 1;
        this.value2TextLength = 0;
    }
    setStyle(_styleElem) {
        if (_styleElem) {
            let textIncrementElem = _styleElem.getElementsByTagName("TextIncrement");
            if (textIncrementElem.length > 0) {
                this.textIncrement = parseInt(textIncrementElem[0].textContent);
            }
            let valuePosElem = _styleElem.getElementsByTagName("ValuePos");
            if (valuePosElem.length > 0) {
                switch (valuePosElem[0].textContent) {
                    case "Right":
                        this.valuePos = 2;
                        this.endX = 70;
                }
            }
        }
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        if (this.valuePos == 2) {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 10 100 24");
        }
        else {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 40");
        }
        this.appendChild(this.rootSvg);
        let bottomBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(bottomBar, "x", this.beginX + '');
        diffAndSetAttribute(bottomBar, "y", "21");
        diffAndSetAttribute(bottomBar, "height", "2");
        diffAndSetAttribute(bottomBar, "width", (this.endX - this.beginX) + '');
        diffAndSetAttribute(bottomBar, "fill", "white");
        this.rootSvg.appendChild(bottomBar);
        this.decorationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.decorationGroup);
        this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationGroup);
        let beginLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(beginLimit, "x", (this.beginX - 1) + '');
        diffAndSetAttribute(beginLimit, "y", "17");
        diffAndSetAttribute(beginLimit, "height", "10");
        diffAndSetAttribute(beginLimit, "width", "2");
        diffAndSetAttribute(beginLimit, "fill", "white");
        this.rootSvg.appendChild(beginLimit);
        let endLimit = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(endLimit, "x", (this.endX - 1) + '');
        diffAndSetAttribute(endLimit, "y", "17");
        diffAndSetAttribute(endLimit, "height", "10");
        diffAndSetAttribute(endLimit, "width", "2");
        diffAndSetAttribute(endLimit, "fill", "white");
        this.rootSvg.appendChild(endLimit);
        this.cursor = document.createElementNS(Avionics.SVG.NS, "polygon");
        diffAndSetAttribute(this.cursor, "points", this.beginX + ",22 " + (this.beginX - 4) + ",12 " + (this.beginX + 4) + ",12");
        diffAndSetAttribute(this.cursor, "fill", "white");
        this.rootSvg.appendChild(this.cursor);
        this.cursor2 = document.createElementNS(Avionics.SVG.NS, "polygon");
        diffAndSetAttribute(this.cursor2, "points", this.beginX + ",22 " + (this.beginX - 4) + ",32 " + (this.beginX + 4) + ",32");
        diffAndSetAttribute(this.cursor2, "fill", "white");
        this.rootSvg.appendChild(this.cursor2);
        this.beginText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.beginText, "x", this.beginX + '');
        diffAndSetAttribute(this.beginText, "y", "40");
        diffAndSetAttribute(this.beginText, "fill", "white");
        diffAndSetAttribute(this.beginText, "font-size", "8");
        diffAndSetAttribute(this.beginText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.beginText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.beginText);
        this.endText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.endText, "x", this.endX + '');
        diffAndSetAttribute(this.endText, "y", "40");
        diffAndSetAttribute(this.endText, "fill", "white");
        diffAndSetAttribute(this.endText, "font-size", "8");
        diffAndSetAttribute(this.endText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.endText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.endText);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.titleText, "x", ((this.endX - this.beginX) / 2 + this.beginX) + '');
        diffAndSetAttribute(this.titleText, "y", "10");
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", "10");
        diffAndSetAttribute(this.titleText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.titleText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.titleText);
        this.valueText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.valueText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.valueText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.valueText_alertbg);
        this.valueText2_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.valueText2_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.valueText2_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.valueText2_alertbg);
        switch (this.valuePos) {
            case 2:
                this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.valueText, "x", (this.endX + 5) + '');
                diffAndSetAttribute(this.valueText, "y", "20");
                diffAndSetAttribute(this.valueText, "fill", "white");
                diffAndSetAttribute(this.valueText, "font-size", "12");
                diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(this.valueText, "text-anchor", "start");
                diffAndSetAttribute(this.valueText, "AlertBlink", "Text");
                this.rootSvg.appendChild(this.valueText);
                this.valueText2 = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.valueText2, "x", (this.endX + 5) + '');
                diffAndSetAttribute(this.valueText2, "y", "32");
                diffAndSetAttribute(this.valueText2, "fill", "white");
                diffAndSetAttribute(this.valueText2, "font-size", "12");
                diffAndSetAttribute(this.valueText2, "font-family", "Roboto-Bold");
                diffAndSetAttribute(this.valueText2, "text-anchor", "start");
                diffAndSetAttribute(this.valueText2, "AlertBlink", "Text");
                this.rootSvg.appendChild(this.valueText2);
        }
    }
    addColorZone(_begin, _end, _color, _context, _smoothFactor) {
        let colorZone = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorZone, "height", "4");
        diffAndSetAttribute(colorZone, "y", "20");
        diffAndSetAttribute(colorZone, "fill", _color);
        this.decorationGroup.appendChild(colorZone);
        this.colorZones.push(new XMLGaugeColorZone(colorZone, _begin, _end, _smoothFactor));
        this.updateColorZone(colorZone, _begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    updateColorZone(_element, _begin, _end) {
        let begin = ((_begin - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX;
        let end = ((_end - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX;
        diffAndSetAttribute(_element, "x", begin + '');
        diffAndSetAttribute(_element, "width", (end - begin) + '');
    }
    addColorLine(_position, _color, _context, _smoothFactor) {
        let colorLine = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorLine, "height", "12");
        diffAndSetAttribute(colorLine, "width", "2");
        diffAndSetAttribute(colorLine, "x", (this.beginX - 1) + '');
        diffAndSetAttribute(colorLine, "y", "16");
        diffAndSetAttribute(colorLine, "fill", _color);
        this.decorationGroup.appendChild(colorLine);
        this.colorLines.push(new XMLGaugeColorLine(colorLine, _position, _smoothFactor));
        this.updateColorLine(colorLine, _position.getValueAsNumber(_context));
    }
    updateColorLine(_element, _pos) {
        if (_pos >= this.minValue && _pos <= this.maxValue) {
            diffAndSetAttribute(_element, "transform", "translate(" + (((_pos - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX)) + " 0)");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLHorizontalDoubleGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    setGraduations(_spaceBetween, _withText = false) {
        for (let i = this.minValue + _spaceBetween; i < this.maxValue; i += _spaceBetween) {
            let grad = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(grad, "x", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX - 0.5) + '');
            diffAndSetAttribute(grad, "y", "17");
            diffAndSetAttribute(grad, "height", "10");
            diffAndSetAttribute(grad, "width", "1");
            diffAndSetAttribute(grad, "fill", "white");
            this.graduationGroup.appendChild(grad);
            if (_withText) {
                let gradText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(gradText, "x", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX) + this.beginX - 0.5) + '');
                diffAndSetAttribute(gradText, "y", "40");
                diffAndSetAttribute(gradText, "fill", "white");
                diffAndSetAttribute(gradText, "font-size", "8");
                diffAndSetAttribute(gradText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(gradText, "text-anchor", "middle");
                diffAndSetText(gradText, i + '');
                this.graduationGroup.appendChild(gradText);
            }
        }
    }
    updateValue(_value, _value2) {
        if (_value != this.lastValue || _value2 != this.lastValue2) {
            let transform1 = "translate(" + (((Math.max(Math.min(_value, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX)) + " 0)";
            diffAndSetAttribute(this.cursor, "transform", transform1);
            if (this.cursorLabel) {
                diffAndSetAttribute(this.cursorLabel, "transform", transform1);
            }
            this.lastValue = _value;
            let transform2 = "translate(" + (((Math.max(Math.min(_value2, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endX - this.beginX)) + " 0)";
            diffAndSetAttribute(this.cursor2, "transform", transform2);
            if (this.cursor2Label) {
                diffAndSetAttribute(this.cursor2Label, "transform", transform2);
            }
            this.lastValue2 = _value2;
            if (this.valueText && this.valueText2) {
                let text1 = this.textIncrement != 1 ? fastToFixed(Math.round(_value / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value, 0);
                ;
                let text2 = this.textIncrement != 1 ? fastToFixed(Math.round(_value2 / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value2, 0);
                diffAndSetText(this.valueText, text1);
                diffAndSetText(this.valueText2, text2);
                let val1Set = false;
                let val2Set = false;
                for (let i = this.colorZones.length - 1; i >= 0; i--) {
                    if (_value >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                        diffAndSetAttribute(this.valueText, "fill", this.colorZones[i].element.getAttribute("fill"));
                        val1Set = true;
                    }
                    if (_value2 >= this.colorZones[i].lastBegin && _value2 <= this.colorZones[i].lastEnd) {
                        diffAndSetAttribute(this.valueText2, "fill", this.colorZones[i].element.getAttribute("fill"));
                        val2Set = true;
                    }
                }
                if (!val1Set) {
                    diffAndSetAttribute(this.valueText, "fill", "white");
                }
                if (!val2Set) {
                    diffAndSetAttribute(this.valueText2, "fill", "white");
                }
                if (this.valueText_alertbg) {
                    if (this.valueTextLength != text1.length) {
                        this.valueTextLength = text1.length;
                        let valueBbox = this.valueText.getBBox();
                        diffAndSetAttribute(this.valueText_alertbg, "x", (valueBbox.x - 1) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "y", (valueBbox.y - 1) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "width", (valueBbox.width + 2) + '');
                        diffAndSetAttribute(this.valueText_alertbg, "height", (valueBbox.height + 2) + '');
                    }
                }
                if (this.valueText2_alertbg) {
                    if (this.value2TextLength != text2.length) {
                        this.value2TextLength = text2.length;
                        let valueBbox = this.valueText2.getBBox();
                        diffAndSetAttribute(this.valueText2_alertbg, "x", (valueBbox.x - 1) + '');
                        diffAndSetAttribute(this.valueText2_alertbg, "y", (valueBbox.y - 1) + '');
                        diffAndSetAttribute(this.valueText2_alertbg, "width", (valueBbox.width + 2) + '');
                        diffAndSetAttribute(this.valueText2_alertbg, "height", (valueBbox.height + 2) + '');
                    }
                }
            }
        }
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title + " " + _unit);
    }
    computeAlertBackgrounds() {
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        if (this.forcedBeginText == null) {
            diffAndSetText(this.beginText, _begin + '');
        }
        if (this.forcedEndText == null) {
            diffAndSetText(this.endText, _end + '');
        }
    }
    forceBeginText(_text) {
        diffAndSetText(this.beginText, _text);
        this.forcedBeginText = _text;
    }
    forceEndText(_text) {
        diffAndSetText(this.endText, _text);
        this.forcedEndText = _text;
    }
    setCursorLabel(_label1, _label2) {
        if (!this.cursorLabel) {
            this.cursorLabel = document.createElementNS(Avionics.SVG.NS, "text");
            diffAndSetAttribute(this.cursorLabel, "x", this.beginX + '');
            diffAndSetAttribute(this.cursorLabel, "y", "18");
            diffAndSetAttribute(this.cursorLabel, "fill", "black");
            diffAndSetAttribute(this.cursorLabel, "font-size", "7");
            diffAndSetAttribute(this.cursorLabel, "font-family", "Roboto-Bold");
            diffAndSetAttribute(this.cursorLabel, "text-anchor", "middle");
            this.rootSvg.appendChild(this.cursorLabel);
        }
        diffAndSetText(this.cursorLabel, _label1);
        if (_label2) {
            if (!this.cursor2Label) {
                this.cursor2Label = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(this.cursor2Label, "x", this.beginX + '');
                diffAndSetAttribute(this.cursor2Label, "y", "31");
                diffAndSetAttribute(this.cursor2Label, "fill", "black");
                diffAndSetAttribute(this.cursor2Label, "font-size", "7");
                diffAndSetAttribute(this.cursor2Label, "font-family", "Roboto-Bold");
                diffAndSetAttribute(this.cursor2Label, "text-anchor", "middle");
                this.rootSvg.appendChild(this.cursor2Label);
            }
            diffAndSetText(this.cursor2Label, _label2);
        }
    }
}
customElements.define('glasscockpit-xmlhorizontaldoublegauge', XMLHorizontalDoubleGauge);
class XMLVerticalGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.endY = 15;
        this.beginY = 70;
        this.cursorColor = "white";
        this.number = 0;
        this.textIncrement = 1;
    }
    setStyle(_styleElem) {
        if (_styleElem) {
            let textIncrementElem = _styleElem.getElementsByTagName("TextIncrement");
            if (textIncrementElem.length > 0) {
                this.textIncrement = parseInt(textIncrementElem[0].textContent);
            }
            let cursorColorElem = _styleElem.getElementsByTagName("CursorColor");
            if (cursorColorElem.length > 0) {
                this.cursorColor = cursorColorElem[0].textContent;
            }
            let valuePosElem = _styleElem.getElementsByTagName("ValuePos");
            if (valuePosElem.length > 0) {
                switch (valuePosElem[0].textContent) {
                    case "None":
                        this.valuePos = 1;
                        break;
                }
            }
        }
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        if (this.valuePos == 1) {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 50 75");
        }
        else {
            diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 50 85");
        }
        this.appendChild(this.rootSvg);
        this.decorationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.decorationGroup);
        this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationGroup);
        let rightBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(rightBar, "x", "35");
        diffAndSetAttribute(rightBar, "y", this.endY + '');
        diffAndSetAttribute(rightBar, "height", (this.beginY - this.endY) + '');
        diffAndSetAttribute(rightBar, "width", "2");
        diffAndSetAttribute(rightBar, "fill", "white");
        this.rootSvg.appendChild(rightBar);
        let beginBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(beginBar, "x", "25");
        diffAndSetAttribute(beginBar, "y", (this.beginY) + '');
        diffAndSetAttribute(beginBar, "height", "2");
        diffAndSetAttribute(beginBar, "width", "12");
        diffAndSetAttribute(beginBar, "fill", "white");
        this.rootSvg.appendChild(beginBar);
        let endBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(endBar, "x", "25");
        diffAndSetAttribute(endBar, "y", (this.endY) + '');
        diffAndSetAttribute(endBar, "height", "2");
        diffAndSetAttribute(endBar, "width", "12");
        diffAndSetAttribute(endBar, "fill", "white");
        this.rootSvg.appendChild(endBar);
        this.cursor = document.createElementNS(Avionics.SVG.NS, "polygon");
        diffAndSetAttribute(this.cursor, "points", "35," + this.beginY + " 32," + (this.beginY - 3) + " 27," + (this.beginY - 3) + " 27," + (this.beginY + 3) + " 32," + (this.beginY + 3));
        diffAndSetAttribute(this.cursor, "fill", this.cursorColor);
        this.rootSvg.appendChild(this.cursor);
        this.titleText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.titleText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.titleText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.titleText_alertbg);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.titleText, "x", "25");
        diffAndSetAttribute(this.titleText, "y", (this.endY - 5) + '');
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", "9");
        diffAndSetAttribute(this.titleText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.titleText, "text-anchor", "middle");
        diffAndSetAttribute(this.titleText, "AlertBlink", "Text");
        this.rootSvg.appendChild(this.titleText);
        this.valueText_alertbg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(this.valueText_alertbg, "fill-opacity", "0");
        diffAndSetAttribute(this.valueText_alertbg, "AlertBlink", "Background");
        this.rootSvg.appendChild(this.valueText_alertbg);
        if (this.valuePos != 1) {
            this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
            diffAndSetAttribute(this.valueText, "x", "25");
            diffAndSetAttribute(this.valueText, "y", (this.beginY + 15) + '');
            diffAndSetAttribute(this.valueText, "fill", "white");
            diffAndSetAttribute(this.valueText, "font-size", "12");
            diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
            diffAndSetAttribute(this.valueText, "text-anchor", "middle");
            diffAndSetAttribute(this.valueText, "AlertBlink", "Text");
            this.rootSvg.appendChild(this.valueText);
        }
        this.beginText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.beginText, "x", "24");
        diffAndSetAttribute(this.beginText, "y", (this.beginY + 4) + '');
        diffAndSetAttribute(this.beginText, "fill", "white");
        diffAndSetAttribute(this.beginText, "font-size", "8");
        diffAndSetAttribute(this.beginText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.beginText, "text-anchor", "end");
        this.rootSvg.appendChild(this.beginText);
        this.endText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.endText, "x", "24");
        diffAndSetAttribute(this.endText, "y", (this.endY + 4) + '');
        diffAndSetAttribute(this.endText, "fill", "white");
        diffAndSetAttribute(this.endText, "font-size", "8");
        diffAndSetAttribute(this.endText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.endText, "text-anchor", "end");
        this.rootSvg.appendChild(this.endText);
    }
    addColorZone(_begin, _end, _color, _context, _smoothFactor) {
        let colorZone = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorZone, "width", "4");
        diffAndSetAttribute(colorZone, "x", "31");
        diffAndSetAttribute(colorZone, "fill", _color);
        this.decorationGroup.appendChild(colorZone);
        this.colorZones.push(new XMLGaugeColorZone(colorZone, _begin, _end, _smoothFactor));
        this.updateColorZone(colorZone, _begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    updateColorZone(_element, _begin, _end) {
        let begin = ((_begin - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY;
        let end = ((_end - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY;
        diffAndSetAttribute(_element, "y", end + '');
        diffAndSetAttribute(_element, "height", (begin - end) + '');
    }
    addColorLine(_position, _color, _context, _smoothFactor) {
        let colorLine = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorLine, "height", "2");
        diffAndSetAttribute(colorLine, "width", "8");
        diffAndSetAttribute(colorLine, "x", "27");
        diffAndSetAttribute(colorLine, "y", this.beginY + '');
        diffAndSetAttribute(colorLine, "fill", _color);
        this.decorationGroup.appendChild(colorLine);
        this.colorLines.push(new XMLGaugeColorLine(colorLine, _position, _smoothFactor));
        this.updateColorLine(colorLine, _position.getValueAsNumber(_context));
    }
    updateColorLine(_element, _pos) {
        if (_pos > this.minValue && _pos < this.maxValue) {
            diffAndSetAttribute(_element, "transform", "translate(0," + (((_pos - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY)) + ")");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLVerticalGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    updateValue(_value, _value2) {
        diffAndSetAttribute(this.cursor, "transform", "translate(0," + (((Math.max(Math.min(_value, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY)) + ")");
        if (this.valueText) {
            let text = this.textIncrement != 1 ? fastToFixed(Math.round(_value / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value, 0);
            ;
            diffAndSetText(this.valueText, text);
            let colorFound = false;
            for (let i = this.colorZones.length - 1; i >= 0; i--) {
                if (_value >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                    diffAndSetAttribute(this.valueText, "fill", this.colorZones[i].element.getAttribute("fill"));
                    colorFound = true;
                    break;
                }
            }
            if (!colorFound) {
                diffAndSetAttribute(this.valueText, "fill", "white");
            }
            if (this.valueText_alertbg) {
                if (this.valueTextLength != text.length) {
                    this.valueTextLength = text.length;
                    let valueBbox = this.valueText.getBBox();
                    diffAndSetAttribute(this.valueText_alertbg, "x", (valueBbox.x - 1) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "y", (valueBbox.y + 1) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "width", (valueBbox.width + 2) + '');
                    diffAndSetAttribute(this.valueText_alertbg, "height", (valueBbox.height) + '');
                }
            }
        }
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title + " " + _unit);
    }
    computeAlertBackgrounds() {
        let titleBbox = this.titleText.getBBox();
        diffAndSetAttribute(this.titleText_alertbg, "x", (titleBbox.x - 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "y", (titleBbox.y + 1) + '');
        diffAndSetAttribute(this.titleText_alertbg, "width", (titleBbox.width + 2) + '');
        diffAndSetAttribute(this.titleText_alertbg, "height", (titleBbox.height - 0.5) + '');
    }
    setGraduations(_spaceBetween, _withText) {
        for (let i = this.minValue + _spaceBetween; i < this.maxValue; i += _spaceBetween) {
            let grad = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(grad, "x", "25");
            diffAndSetAttribute(grad, "y", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY - 0.5) + '');
            diffAndSetAttribute(grad, "height", "1");
            diffAndSetAttribute(grad, "width", "10");
            diffAndSetAttribute(grad, "fill", "white");
            this.graduationGroup.appendChild(grad);
            if (_withText) {
                let gradText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(gradText, "x", "23");
                diffAndSetAttribute(gradText, "y", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY + 4) + '');
                diffAndSetAttribute(gradText, "fill", "white");
                diffAndSetAttribute(gradText, "font-size", "8");
                diffAndSetAttribute(gradText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(gradText, "text-anchor", "end");
                diffAndSetText(gradText, i + '');
                this.graduationGroup.appendChild(gradText);
            }
        }
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        if (this.forcedBeginText == null) {
            diffAndSetText(this.beginText, _begin + '');
        }
        if (this.forcedEndText == null) {
            diffAndSetText(this.endText, _end + '');
        }
    }
    forceBeginText(_text) {
        diffAndSetText(this.beginText, _text);
        this.forcedBeginText = _text;
    }
    forceEndText(_text) {
        diffAndSetText(this.endText, _text);
        this.forcedEndText = _text;
    }
    setCursorLabel(_label1, _label2) {
    }
}
customElements.define('glasscockpit-xmlverticalgauge', XMLVerticalGauge);
class XMLVerticalDoubleGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.endY = 15;
        this.beginY = 95;
        this.height = 100;
        this.textIncrement = 1;
    }
    setStyle(_styleElem) {
        if (_styleElem) {
            let textIncrementElem = _styleElem.getElementsByTagName("TextIncrement");
            if (textIncrementElem.length > 0) {
                this.textIncrement = parseInt(textIncrementElem[0].textContent);
            }
            let heightElem = _styleElem.getElementsByTagName("Height");
            if (heightElem.length > 0) {
                this.height = parseFloat(heightElem[0].textContent);
                this.beginY = this.height - 5;
            }
        }
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        diffAndSetAttribute(this.rootSvg, "overflow", "hidden");
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 " + this.height);
        this.appendChild(this.rootSvg);
        this.decorationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.decorationGroup);
        this.graduationGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationGroup);
        let beginBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(beginBar, "x", "25");
        diffAndSetAttribute(beginBar, "y", (this.beginY) + '');
        diffAndSetAttribute(beginBar, "height", "2");
        diffAndSetAttribute(beginBar, "width", "50");
        diffAndSetAttribute(beginBar, "fill", "white");
        this.rootSvg.appendChild(beginBar);
        let endBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(endBar, "x", "25");
        diffAndSetAttribute(endBar, "y", (this.endY) + '');
        diffAndSetAttribute(endBar, "height", "2");
        diffAndSetAttribute(endBar, "width", "50");
        diffAndSetAttribute(endBar, "fill", "white");
        this.rootSvg.appendChild(endBar);
        let gradTextBackground = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(gradTextBackground, "x", "36");
        diffAndSetAttribute(gradTextBackground, "y", (this.endY - 5) + '');
        diffAndSetAttribute(gradTextBackground, "width", "28");
        diffAndSetAttribute(gradTextBackground, "height", (this.beginY - this.endY + 10) + '');
        diffAndSetAttribute(gradTextBackground, "fill", "#1a1d21");
        this.rootSvg.appendChild(gradTextBackground);
        this.graduationTextGroup = document.createElementNS(Avionics.SVG.NS, "g");
        this.rootSvg.appendChild(this.graduationTextGroup);
        let barLeft = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(barLeft, "x", "34");
        diffAndSetAttribute(barLeft, "y", this.endY + '');
        diffAndSetAttribute(barLeft, "height", (this.beginY - this.endY) + '');
        diffAndSetAttribute(barLeft, "width", "2");
        diffAndSetAttribute(barLeft, "fill", "white");
        this.rootSvg.appendChild(barLeft);
        let barRight = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(barRight, "x", "64");
        diffAndSetAttribute(barRight, "y", this.endY + '');
        diffAndSetAttribute(barRight, "height", (this.beginY - this.endY) + '');
        diffAndSetAttribute(barRight, "width", "2");
        diffAndSetAttribute(barRight, "fill", "white");
        this.rootSvg.appendChild(barRight);
        this.cursor = document.createElementNS(Avionics.SVG.NS, "polygon");
        diffAndSetAttribute(this.cursor, "points", "30," + this.beginY + " 20," + this.beginY + " 20," + (this.beginY + this.beginY - this.endY) + " 25," + (this.beginY + this.beginY - this.endY) + " 25," + (this.beginY + 10));
        diffAndSetAttribute(this.cursor, "fill", "white");
        this.rootSvg.appendChild(this.cursor);
        this.cursor2 = document.createElementNS(Avionics.SVG.NS, "polygon");
        diffAndSetAttribute(this.cursor2, "points", "70," + this.beginY + " 80," + this.beginY + " 80," + (this.beginY + this.beginY - this.endY) + " 75," + (this.beginY + this.beginY - this.endY) + " 75," + (this.beginY + 10));
        diffAndSetAttribute(this.cursor2, "fill", "white");
        this.rootSvg.appendChild(this.cursor2);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.titleText, "x", "50");
        diffAndSetAttribute(this.titleText, "y", (this.endY - 5) + '');
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", "9");
        diffAndSetAttribute(this.titleText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.titleText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.titleText);
        this.valueText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.valueText, "x", "35");
        diffAndSetAttribute(this.valueText, "y", (this.endY - 2) + '');
        diffAndSetAttribute(this.valueText, "fill", "white");
        diffAndSetAttribute(this.valueText, "font-size", "12");
        diffAndSetAttribute(this.valueText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.valueText, "text-anchor", "end");
        this.rootSvg.appendChild(this.valueText);
        this.valueText2 = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.valueText2, "x", "65");
        diffAndSetAttribute(this.valueText2, "y", (this.endY - 2) + '');
        diffAndSetAttribute(this.valueText2, "fill", "white");
        diffAndSetAttribute(this.valueText2, "font-size", "12");
        diffAndSetAttribute(this.valueText2, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.valueText2, "text-anchor", "start");
        this.rootSvg.appendChild(this.valueText2);
        this.beginText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.beginText, "x", "50");
        diffAndSetAttribute(this.beginText, "y", (this.beginY + 4) + '');
        diffAndSetAttribute(this.beginText, "fill", "white");
        diffAndSetAttribute(this.beginText, "font-size", "8");
        diffAndSetAttribute(this.beginText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.beginText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.beginText);
        this.endText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.endText, "x", "50");
        diffAndSetAttribute(this.endText, "y", (this.endY + 4) + '');
        diffAndSetAttribute(this.endText, "fill", "white");
        diffAndSetAttribute(this.endText, "font-size", "8");
        diffAndSetAttribute(this.endText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.endText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.endText);
    }
    addColorZone(_begin, _end, _color, _context, _smoothFactor) {
        let colorZone = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorZone, "width", "40");
        diffAndSetAttribute(colorZone, "x", "30");
        diffAndSetAttribute(colorZone, "fill", _color);
        this.decorationGroup.appendChild(colorZone);
        this.colorZones.push(new XMLGaugeColorZone(colorZone, _begin, _end, _smoothFactor));
        this.updateColorZone(colorZone, _begin.getValueAsNumber(_context), _end.getValueAsNumber(_context));
    }
    updateColorZone(_element, _begin, _end) {
        let begin = ((_begin - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY;
        let end = ((_end - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY;
        diffAndSetAttribute(_element, "y", end + '');
        diffAndSetAttribute(_element, "height", (begin - end) + '');
    }
    addColorLine(_position, _color, _context, _smoothFactor) {
        let colorLine = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(colorLine, "height", "2");
        diffAndSetAttribute(colorLine, "width", "46");
        diffAndSetAttribute(colorLine, "x", "27");
        diffAndSetAttribute(colorLine, "y", this.beginY + '');
        diffAndSetAttribute(colorLine, "fill", _color);
        this.decorationGroup.appendChild(colorLine);
        this.colorLines.push(new XMLGaugeColorLine(colorLine, _position, _smoothFactor));
        this.updateColorLine(colorLine, _position.getValueAsNumber(_context));
    }
    updateColorLine(_element, _pos) {
        if (_pos > this.minValue && _pos < this.maxValue) {
            diffAndSetAttribute(_element, "transform", "translate(0," + (((_pos - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY)) + ")");
            diffAndSetAttribute(_element, "display", "");
        }
        else {
            diffAndSetAttribute(_element, "display", "none");
        }
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLVerticalDoubleGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    updateValue(_value, _value2) {
        diffAndSetAttribute(this.cursor, "transform", "translate(0," + (((Math.max(Math.min(_value, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY)) + ")");
        diffAndSetAttribute(this.cursor2, "transform", "translate(0," + (((Math.max(Math.min(_value2, this.maxValue), this.minValue) - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY)) + ")");
        diffAndSetText(this.valueText, this.textIncrement != 1 ? fastToFixed(Math.round(_value / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value, 0));
        diffAndSetText(this.valueText2, this.textIncrement != 1 ? fastToFixed(Math.round(_value2 / this.textIncrement) * this.textIncrement, 0) : fastToFixed(_value2, 0));
        let val1Set = false;
        let val2Set = false;
        for (let i = this.colorZones.length - 1; i >= 0; i--) {
            if (_value >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                diffAndSetAttribute(this.valueText, "fill", this.colorZones[i].element.getAttribute("fill"));
                val1Set = true;
            }
            if (_value2 >= this.colorZones[i].lastBegin && _value <= this.colorZones[i].lastEnd) {
                diffAndSetAttribute(this.valueText2, "fill", this.colorZones[i].element.getAttribute("fill"));
                val2Set = true;
            }
        }
        if (!val1Set) {
            diffAndSetAttribute(this.valueText, "fill", "white");
        }
        if (!val2Set) {
            diffAndSetAttribute(this.valueText2, "fill", "white");
        }
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title + " " + _unit);
    }
    computeAlertBackgrounds() {
    }
    setGraduations(_spaceBetween, _withText) {
        for (let i = this.minValue + _spaceBetween; i < this.maxValue; i += _spaceBetween) {
            let grad = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(grad, "x", "29");
            diffAndSetAttribute(grad, "y", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY - 0.5) + '');
            diffAndSetAttribute(grad, "height", "1");
            diffAndSetAttribute(grad, "width", "42");
            diffAndSetAttribute(grad, "fill", "white");
            this.graduationGroup.appendChild(grad);
            if (_withText) {
                let gradText = document.createElementNS(Avionics.SVG.NS, "text");
                diffAndSetAttribute(gradText, "x", "50");
                diffAndSetAttribute(gradText, "y", (((i - this.minValue) / (this.maxValue - this.minValue)) * (this.endY - this.beginY) + this.beginY + 4) + '');
                diffAndSetAttribute(gradText, "fill", "white");
                diffAndSetAttribute(gradText, "font-size", "8");
                diffAndSetAttribute(gradText, "font-family", "Roboto-Bold");
                diffAndSetAttribute(gradText, "text-anchor", "middle");
                diffAndSetText(gradText, i + '');
                this.graduationTextGroup.appendChild(gradText);
            }
        }
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        if (this.forcedBeginText == null) {
            diffAndSetText(this.beginText, _begin + '');
        }
        if (this.forcedEndText == null) {
            diffAndSetText(this.endText, _end + '');
        }
    }
    forceBeginText(_text) {
        diffAndSetText(this.beginText, _text);
        this.forcedBeginText = _text;
    }
    forceEndText(_text) {
        diffAndSetText(this.endText, _text);
        this.forcedEndText = _text;
    }
    setCursorLabel(_label1, _label2) {
    }
}
customElements.define('glasscockpit-xmlverticaldoublegauge', XMLVerticalDoubleGauge);
class XMLFlapsGauge extends XMLGauge {
    constructor() {
        super(...arguments);
        this.takeOffValue = 10;
    }
    setStyle(_styleElem) {
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 50");
        diffAndSetAttribute(this.rootSvg, "overflow", "visible");
        this.appendChild(this.rootSvg);
        this.cursor = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(this.cursor, "d", "M10 10 Q25 0 60 10 Q25 20 10 10");
        diffAndSetAttribute(this.cursor, "fill", "aqua");
        this.rootSvg.appendChild(this.cursor);
        this.titleText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.titleText, "x", "5");
        diffAndSetAttribute(this.titleText, "y", "45");
        diffAndSetAttribute(this.titleText, "fill", "white");
        diffAndSetAttribute(this.titleText, "font-size", "12");
        diffAndSetText(this.titleText, "FLAPS");
        this.rootSvg.appendChild(this.titleText);
    }
    addColorZone(_begin, _end, _color) {
        console.warn("ColorZone on XMLFlapsGauge is not implemented");
    }
    updateColorZone(_element, _begin, _end) {
    }
    addColorLine(_position, _color) {
        console.warn("ColorLine on XMLFlapsGauge is not implemented");
    }
    updateColorLine(_element, _pos) {
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLFlapsGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    updateValue(_value, _value2) {
        diffAndSetAttribute(this.cursor, "transform", "rotate(" + _value + " 10 10)");
    }
    setTitleAndUnit(_title, _unit) {
        diffAndSetText(this.titleText, _title);
    }
    computeAlertBackgrounds() {
    }
    setGraduations(_spaceBetween, _withText) {
    }
    forceBeginText(_text) {
    }
    forceEndText(_text) {
    }
    setCursorLabel(_label1, _label2) {
    }
    setTakeOffValue(_value) {
        this.takeOffValue = _value;
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);
        let angles = [this.minValue, this.takeOffValue, this.maxValue];
        let texts = ["UP", "T/O", "LDG"];
        for (let i = 0; i < angles.length; i++) {
            let graduation = document.createElementNS(Avionics.SVG.NS, "rect");
            diffAndSetAttribute(graduation, "x", "60");
            diffAndSetAttribute(graduation, "y", "10");
            diffAndSetAttribute(graduation, "height", "1");
            diffAndSetAttribute(graduation, "width", "10");
            diffAndSetAttribute(graduation, "fill", "white");
            diffAndSetAttribute(graduation, "transform", "rotate(" + angles[i] + " 10 10)");
            this.rootSvg.appendChild(graduation);
            let text = document.createElementNS(Avionics.SVG.NS, "text");
            let radAngle = angles[i] * Math.PI / 180;
            diffAndSetAttribute(text, "x", (10 + 65 * Math.cos(radAngle)) + '');
            diffAndSetAttribute(text, "y", (15 + 65 * Math.sin(radAngle)) + '');
            diffAndSetAttribute(text, "fill", "white");
            diffAndSetAttribute(text, "font-size", "10");
            diffAndSetText(text, texts[i]);
            this.rootSvg.appendChild(text);
        }
    }
}
customElements.define('glasscockpit-xmlflapsgauge', XMLFlapsGauge);
class XMLLongitudeFuelGauge extends XMLGauge {
    setStyle(_styleElem) {
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        diffAndSetAttribute(this.rootSvg, "viewBox", "0 0 100 30");
        diffAndSetAttribute(this.rootSvg, "overflow", "visible");
        this.appendChild(this.rootSvg);
        let leftBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(leftBg, "x", "5");
        diffAndSetAttribute(leftBg, "y", "20");
        diffAndSetAttribute(leftBg, "width", "25");
        diffAndSetAttribute(leftBg, "height", "10");
        diffAndSetAttribute(leftBg, "stroke", "grey");
        diffAndSetAttribute(leftBg, "fill", "none");
        this.rootSvg.appendChild(leftBg);
        let rightBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(rightBg, "x", "70");
        diffAndSetAttribute(rightBg, "y", "20");
        diffAndSetAttribute(rightBg, "width", "25");
        diffAndSetAttribute(rightBg, "height", "10");
        diffAndSetAttribute(rightBg, "stroke", "grey");
        diffAndSetAttribute(rightBg, "fill", "none");
        this.rootSvg.appendChild(rightBg);
        let totalBg = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(totalBg, "x", "35");
        diffAndSetAttribute(totalBg, "y", "10");
        diffAndSetAttribute(totalBg, "width", "30");
        diffAndSetAttribute(totalBg, "height", "10");
        diffAndSetAttribute(totalBg, "stroke", "grey");
        diffAndSetAttribute(totalBg, "fill", "none");
        this.rootSvg.appendChild(totalBg);
        let horizBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(horizBar, "x", "30");
        diffAndSetAttribute(horizBar, "y", "24.5");
        diffAndSetAttribute(horizBar, "width", "40");
        diffAndSetAttribute(horizBar, "height", "1");
        diffAndSetAttribute(horizBar, "fill", "grey");
        this.rootSvg.appendChild(horizBar);
        let vertBar = document.createElementNS(Avionics.SVG.NS, "rect");
        diffAndSetAttribute(vertBar, "x", "49.5");
        diffAndSetAttribute(vertBar, "y", "20");
        diffAndSetAttribute(vertBar, "width", "1");
        diffAndSetAttribute(vertBar, "height", "5");
        diffAndSetAttribute(vertBar, "fill", "grey");
        this.rootSvg.appendChild(vertBar);
        let leftText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(leftText, "x", "30");
        diffAndSetAttribute(leftText, "y", "18");
        diffAndSetAttribute(leftText, "fill", "white");
        diffAndSetAttribute(leftText, "font-size", "7");
        diffAndSetAttribute(leftText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(leftText, "text-anchor", "end");
        this.rootSvg.appendChild(leftText);
        diffAndSetText(leftText, "TOT");
        let rightText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(rightText, "x", "70");
        diffAndSetAttribute(rightText, "y", "18");
        diffAndSetAttribute(rightText, "fill", "white");
        diffAndSetAttribute(rightText, "font-size", "7");
        diffAndSetAttribute(rightText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(rightText, "text-anchor", "start");
        this.rootSvg.appendChild(rightText);
        diffAndSetText(rightText, "LBS");
        this.leftText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.leftText, "x", "17.5");
        diffAndSetAttribute(this.leftText, "y", "28");
        diffAndSetAttribute(this.leftText, "fill", "green");
        diffAndSetAttribute(this.leftText, "font-size", "7");
        diffAndSetAttribute(this.leftText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.leftText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.leftText);
        this.rightText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.rightText, "x", "82.5");
        diffAndSetAttribute(this.rightText, "y", "28");
        diffAndSetAttribute(this.rightText, "fill", "green");
        diffAndSetAttribute(this.rightText, "font-size", "7");
        diffAndSetAttribute(this.rightText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.rightText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.rightText);
        this.totalText = document.createElementNS(Avionics.SVG.NS, "text");
        diffAndSetAttribute(this.totalText, "x", "50");
        diffAndSetAttribute(this.totalText, "y", "18");
        diffAndSetAttribute(this.totalText, "fill", "green");
        diffAndSetAttribute(this.totalText, "font-size", "7");
        diffAndSetAttribute(this.totalText, "font-family", "Roboto-Bold");
        diffAndSetAttribute(this.totalText, "text-anchor", "middle");
        this.rootSvg.appendChild(this.totalText);
    }
    addColorZone(_begin, _end, _color) {
        console.warn("ColorZone on XMLLongitudeFuelGauge is not implemented");
    }
    updateColorZone(_element, _begin, _end) {
    }
    addColorLine(_position, _color) {
        console.warn("ColorLine on XMLLongitudeFuelGauge is not implemented");
    }
    updateColorLine(_element, _pos) {
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLLongitudeFuelGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    updateValue(_value, _value2) {
        let galToLbs = 6.7;
        diffAndSetText(this.leftText, fastToFixed(_value * galToLbs, 0));
        diffAndSetText(this.rightText, fastToFixed(_value2 * galToLbs, 0));
        diffAndSetText(this.totalText, fastToFixed((_value + _value2) * galToLbs, 0));
    }
    setTitleAndUnit(_title, _unit) {
    }
    computeAlertBackgrounds() {
    }
    setGraduations(_spaceBetween, _withText) {
    }
    forceBeginText(_text) {
    }
    forceEndText(_text) {
    }
    setCursorLabel(_label1, _label2) {
    }
}
customElements.define('glasscockpit-xmllongitudefuelgauge', XMLLongitudeFuelGauge);
class XMLFlapsSpeedbrakesGauge extends XMLGauge {
    setStyle(_styleElem) {
    }
    drawBase() {
        this.rootSvg = document.createElementNS(Avionics.SVG.NS, "svg");
        diffAndSetAttribute(this.rootSvg, "width", this.sizePercent + "%");
        diffAndSetAttribute(this.rootSvg, "viewBox", "-10 -5 120 55");
        diffAndSetAttribute(this.rootSvg, "overflow", "visible");
        this.appendChild(this.rootSvg);
        let wing = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(wing, "d", "M45 12 C40 11, 30 10, 22 10 C0 13, 0 24, 23 24 C35 25, 50 25, 70 24 C65 21, 70 17, 71 17 L62 15");
        diffAndSetAttribute(wing, "stroke", "white");
        diffAndSetAttribute(wing, "stroke-width", "0.5");
        diffAndSetAttribute(wing, "fill", "none");
        this.rootSvg.appendChild(wing);
        this.speedbrakes = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(this.speedbrakes, "d", "M49 14 Q44.75 12, 49 11 Q71.5 15.5, 49 14");
        diffAndSetAttribute(this.speedbrakes, "fill", "white");
        this.rootSvg.appendChild(this.speedbrakes);

        this.speedbrakeIndicator = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(this.speedbrakeIndicator, "d", "M61 15 C62,5 55,0 50,0 L49 3");
        diffAndSetAttribute(this.speedbrakeIndicator, "stroke", "white");
        diffAndSetAttribute(this.speedbrakeIndicator, "stroke-width", "0.5");
        diffAndSetAttribute(this.speedbrakeIndicator, "fill", "none");
        diffAndSetAttribute(this.speedbrakeIndicator, "visibility", "hidden");
        this.rootSvg.appendChild(this.speedbrakeIndicator);

        this.flaps = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(this.flaps, "d", "M75 23.5 Q68 20.5, 75 17.5 Q110 22.5, 75 23.5 M75 22.5");
        diffAndSetAttribute(this.flaps, "fill", "white");
        this.rootSvg.appendChild(this.flaps);

        this.flapsIndicator = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(this.flapsIndicator, "d", "M94 21.5 L97 18.5 L96 21.5 L97 24.5");
        diffAndSetAttribute(this.flapsIndicator, "fill", "cyan");
        this.rootSvg.appendChild(this.flapsIndicator);
    }
    addColorZone(_begin, _end, _color) {
        console.warn("ColorZone on XMLFlapsSpeedbrakesGauge is not implemented");
    }
    updateColorZone(_element, _begin, _end) {
    }
    addColorLine(_position, _color) {
        console.warn("ColorLine on XMLFlapsSpeedbrakesGauge is not implemented");
    }
    updateColorLine(_element, _pos) {
    }
    addReferenceBug(_position, _displayed, _styleElem, _context, _smoothFactor) {
        console.warn("ReferenceBug on XMLFlapsSpeedbrakesGauge is not implemented");
    }
    updateReferenceBug(_element, _pos, _displayed) {
    }
    updateValue(_value, _value2) {
        diffAndSetAttribute(this.flaps, "transform", "rotate(" + _value * 2 + " 72.5 20.5)");
        diffAndSetAttribute(this.flapsIndicator, "transform", "rotate(" + _value * 2 + " 72.5 20.5)");
        diffAndSetAttribute(this.speedbrakes, "transform", "rotate(" + _value2 + " 48 12.4)");
        diffAndSetAttribute(this.speedbrakeIndicator, "visibility", _value2 < 0 ? "visible" : "hidden");
    }
    setTitleAndUnit(_title, _unit) {
    }
    computeAlertBackgrounds() {
    }
    setGraduations(_spaceBetween, _withText) {
    }
    forceBeginText(_text) {
    }
    forceEndText(_text) {
    }
    setCursorLabel(_label1, _label2) {
    }
    setLimitValues(_begin, _end) {
        super.setLimitValues(_begin, _end);

        // The stock Longitude doesn't have the max value set correctly
        if (this.maxValue == 360)
            this.maxValue = 35;

        let rotationAxisX = 72.5;
        let rotationAxisY = 20.5;
        var getPositionX = function(angle, distance) {
            let radAngle = angle * 2 * Math.PI / 180;
            return (rotationAxisX + distance * Math.cos(radAngle));
        };

        var getPositionY = function(angle, distance) {
          let radAngle = angle * 2 * Math.PI / 180;
          return (rotationAxisY + distance * Math.sin(radAngle));
        };

        let distance = 21;
        let upPosX = getPositionX(this.minValue + 1, distance);
        let upPosY = getPositionY(this.minValue + 1, distance);
        let downPosX = getPositionX(this.maxValue + 2, distance);
        let downPosY = getPositionY(this.maxValue + 2, distance);

        let flapsArc = document.createElementNS(Avionics.SVG.NS, "path");
        diffAndSetAttribute(flapsArc, "d", `M${upPosX} ${upPosY} C${upPosX},${upPosY + 10} ${downPosX + 2},${downPosY} ${downPosX},${downPosY}`);
        diffAndSetAttribute(flapsArc, "stroke", "white");
        diffAndSetAttribute(flapsArc, "stroke-width", "0.5");
        diffAndSetAttribute(flapsArc, "fill", "none");
        this.rootSvg.appendChild(flapsArc);

        let angles = [this.minValue, this.maxValue * 0.3, this.maxValue * 0.6, this.maxValue * 1.2];
        let texts = ["UP", "1", "2", "FULL"];
        for (let i = 0; i < angles.length; i++) {
            let text = document.createElementNS(Avionics.SVG.NS, "text");
            diffAndSetAttribute(text, "x", getPositionX(angles[i], 26) + '');
            diffAndSetAttribute(text, "y", getPositionY(angles[i], 26) + 4 + '');
            diffAndSetAttribute(text, "fill", "white");
            diffAndSetAttribute(text, "font-size", "8");
            diffAndSetText(text, texts[i]);
            this.rootSvg.appendChild(text);
        }
    }
}
customElements.define('glasscockpit-xmlflapsspeedbrakesgauge', XMLFlapsSpeedbrakesGauge);
//# sourceMappingURL=XMLEngineDisplay.js.map
