// trying to bind most methods to fmcmaindisplay to instance
// to be able to use basic variables from there

class WT_FMC_Renderer {
    // takes the fmc instance
    constructor(fmc) {
        this._fmc = fmc;

        // overrides
        this._fmc.setTemplate = this.setTemplate;
        this._fmc.setTitle = this.setTitle;
        this._fmc.setLabel = this.setLabel;
        this._fmc.setLine = this.setLine;
        this._fmc.legacyOnEvent = fmc.onEvent;
        this._fmc.onEvent = this.onEvent;
        // this._fmc.clearDisplay = this.clearDisplay.bind(fmc); // only for prototype
        FMCMainDisplay.clrValue = "DELETE";
        this._fmc.legacyOnInputAircraftSpecific = fmc.onInputAircraftSpecific;
        this._fmc.onInputAircraftSpecific = this.onInputAircraftSpecific;
        this._fmc.clearUserInput = this.clearUserInput;
        this._fmc.onClr = this.onClr;
        this._fmc.showErrorMessage = this.showErrorMessage;

        // bind own methods to fmc
        // this._fmc.setTemplateRaw = this.setTemplateRaw; // just a prototype
        // this._fmc.renderLetters = this.renderLetters.bind(fmc); // just a prototype
        // this._fmc.renderScratchpadRaw = this.renderScratchpadRaw.bind(fmc); // just a prototype
        this._fmc.setTitle3Head = this.setTitle3Head.bind(fmc);
        this._fmc.renderHeader = this.renderHeader.bind(fmc);
        this._fmc.parseContent = this.parseContent.bind(fmc);

        this._fmc._errorMessage = "";
        this._fmc.isDisplayingErrorMessage = false;

        // init layout
        // this._fmc.renderHeader();
        // this.renderScratchpad();
        // this._messageBox = this.renderMsgLine();
        // this._execEl = this.renderExec();
    }

    // -----------------------------
    // !!! PROTOTYPE for char grid
    // -----------------------------
    setTemplateRaw(template, defaultAlternatingLayout = true) {
        // console.log("Rendering page");

        // clear just to be sure
        const existingContainer = document.getElementById("wt_container");
        if (existingContainer) existingContainer.remove();

        // create container
        var container = document.createElement("div");
        container.id = "wt_container";

        for (let r = 0; r < 15; r++) {
            // rows
            var row = document.createElement("div");
            if (r > 0) {
                row.classList.add("fmc-row");
            } else {
                row.classList.add("fmc-header");
            }

            if (defaultAlternatingLayout && r % 2 == 1) row.classList.add("s-text"); // i guess we remove this and the template does it

            // create spans
            var ltrContainer = document.createElement("div");
            ltrContainer.classList.add("ltrContainer");
            for (let c = 0; c < 24; c++) {
                var colContainer = document.createElement("div");
                colContainer.classList.add("ltrContainer");
                var col = document.createElement("div");
                col.classList.add("letter");
                colContainer.appendChild(col);
                row.appendChild(colContainer);
            }

            // only content
            if (r < 13 && template[r]) {
                if (template[r][0] !== "") {
                    // LEFT
                    this.renderLetters(template[r][0], row);
                }

                if (template[r][1] && template[r][1] !== "") {
                    // RIGHT
                    this.renderLetters(template[r][1], row, "right");
                }

                if (template[r][2] && template[r][2] !== "") {
                    // CENTER
                    this.renderLetters(template[r][2], row, "center");
                }
            } else if (r === 13) {
                // scratchpad
                this.renderScratchpadRaw(row);
            } else if (r === 14) {
                // msg
                this.renderMsgLineRaw(row);
            }

            container.appendChild(row);
        }

        const mainFrame = document.getElementById("Electricity");
        mainFrame.appendChild(container);
    }

    // DIR = left, right, center
    renderLetters(template, row, dir = "left") {
        if (!row) return;
        const cnt = this._fmc.parseContent(template); // TODO remove from fmc scope later
        let charCount = 0;
        // count all letters
        cnt.forEach(x => {
            charCount += x.textContent.length;
        });

        charCount = Math.min(charCount, 24);

        // set start pos
        let ci = 0;
        if (dir === "right")
            ci = 24 - (charCount);
        else if (dir == "center")
            ci = Math.round(((23 / 2) - (charCount / 2)), 0);

        // render
        cnt.forEach(x => {
            const letters = x.textContent.split("");
            (letters).forEach(c => {
                if (ci > 23) return; // no break in js, wtf
                row.childNodes[ci].childNodes[0].className = "";
                row.childNodes[ci].childNodes[0].classList.add("letter");
                row.childNodes[ci].childNodes[0].classList.add(...x.classList);
                row.childNodes[ci].childNodes[0].textContent = c;
                ci++;
            });
        });
    }

    renderSwitch(itemsArr, selectedIndex, onClass = "green", offClass = "white s-text") {
        let result = "";
        for (let i = 0; i < itemsArr.length; i++) {
            const item = itemsArr[i];
            const format = (i == selectedIndex) ? "[" + onClass + "]" : "[" + offClass + "]";
            result += item + format;
            if (i < (itemsArr.length - 1))
                result += "/[white]";
        }
        return result;
    }

    onEvent(e) {
        if (this.isDisplayingErrorMessage) {
            this.setMsg("");
        }

        this.legacyOnEvent(e);

        if (document.getElementById("wt_container")) {
            this._templateRenderer.renderScratchpadRaw(this._templateRenderer.getTRow(13));
        }
    }

    getTRow(index) {
        const container = document.getElementById("wt_container");
        if (!container) {
            // console.warn("Warning: Row " + index + " not found");
            return undefined;
        }

        return container.childNodes[index];
    }

    renderScratchpadRaw(row) {
        row.classList.remove("s-text");
        row.style.marginTop = "-1%";

        // clear everything (TODO: could be better)
        row.childNodes.forEach(n => {
            n.childNodes[0].textContent = "";
        });

        if (this._fmc.isDisplayingErrorMessage) {
            this.renderLetters(this._fmc._errorMessage, row, "center");
        } else {
            // get inout
            const inout = this._fmc.inOut;
            this.renderLetters(" " + inout, row);
        }

        // render hacky brackets
        row.childNodes[0].childNodes[0].classList.add("blue");
        row.childNodes[0].childNodes[0].textContent = "[";
        row.childNodes[23].childNodes[0].classList.add("blue");
        row.childNodes[23].childNodes[0].textContent = "]";
    }

    renderMsgLineRaw(row) {
        if (row === undefined) {
            return;
        }

        // clear everything (TODO: could be better)
        row.childNodes.forEach(n => {
            n.childNodes[0].textContent = "";
        });

        // render
        this.renderLetters(this._fmc._msg, row);

        // i don't really like to "bind" this here, but its ok for now
        if (this._fmc.fpHasChanged) {
            this.showExec(row);
        } else {
            this.hideExec(row);
        }
    }

    clearUserInput() {
        if (!this.isDisplayingErrorMessage) {
            this.lastUserInput = this.inOut.toString();
            this.inOut = "";
        }
    }

    showErrorMessage(message) {

        // in case someone didn't call "clearUserInput()" before calling this function
        if (this.inOut.length > 0) {
            this.lastUserInput = this.inOut.toString();
            this.inOut = "";
        }

        const error_message = message;
        this.isDisplayingErrorMessage = true;
        this._errorMessage = error_message;

        setTimeout(() => {
            if (this.isDisplayingErrorMessage) {
                this.onClr();
                this.onEvent("trigger renderScratchpadRaw");
            }
        }, 1250);

        // if you remove this, scratchpad sometimes will not be rendered.
        // Because "renderScratchpadRaw()" will be called before "showErrorMessage()".
        // I could not figure another way...
        this.onEvent("trigger renderScratchpadRaw");
    }

    onClr() {
        if (this.isDisplayingErrorMessage) {
            this.inOut = this.lastUserInput;
            this.lastUserInput = "";
            this.isDisplayingErrorMessage = false;
        } else if (this.inOut === FMCMainDisplay.clrValue) {
            this.inOut = "";
            this.lastUserInput = "";
        } else if (this.inOut.length > 0) {
            this.inOut = this.inOut.substr(0, this.inOut.length - 1);
        } else {
            this.inOut = FMCMainDisplay.clrValue;
        }
    }

    onInputAircraftSpecific(input) {
        switch (true) {
            case input == "CLR":
                break;
            case FMCMainDisplay._AvailableKeys.indexOf(input) !== -1:
            case input == "SP":
            case input == "DIV":
            case input == "DOT":
            case input == "PLUSMINUS":
            case input.length == 2 && (input[0] == "L" || input[0] == "R"):
                if (this.isDisplayingErrorMessage) {
                    // return previous user input into scratchpad and stop.
                    this.onClr();
                    return true;
                }
                break;
            default: // (switching pages)
                if (this.isDisplayingErrorMessage) {
                    this.onClr();
                }
                this.setMsg();
                break;
        }
        this.legacyOnInputAircraftSpecific(input);
    }

    setMsg(msg) {
        this._fmc._msg = msg;
        this.renderMsgLineRaw(this.getTRow(14));
    }

    showExec(row = this.getTRow(14)) {
        // console.log("Show EXEC");
        this.renderLetters("EXEC[blackwhite]", row, "right");
    }

    hideExec(row = this.getTRow(14)) {
        // console.log("Hide EXEC");
        this.renderLetters("    ", row, "right");
    }

    // -----------------------------
    // Old style rendering
    // -----------------------------

    // FMCMainDisplay overrides

    setTemplate(template) {
        // if (template[0]) {
        //     if (template[0].length > 3) {
        //         this.setTitle(template[0][0], 0);
        //         this.setTitle(template[0][1], 1);
        //         this.setTitle(template[0][2], 2);
        //         this.setPageCurrent(template[0][3]);
        //         this.setPageCount(template[0][4]);
        //     } else {
        //         // backwards compat
        //         this.setTitle(template[0][0]);
        //         this.setPageCurrent(template[0][1]);
        //         this.setPageCount(template[0][2]);
        //     }
        // }
        // for (let i = 0; i < 6; i++) {
        //     let tIndex = 2 * i + 1;
        //     if (template[tIndex]) {
        //         if (template[tIndex][1] !== undefined) {
        //             this.setLabel(template[tIndex][0], i, 0);
        //             this.setLabel(template[tIndex][1], i, 1);
        //             this.setLabel(template[tIndex][2], i, 2);
        //             this.setLabel(template[tIndex][3], i, 3);
        //         }
        //         else {
        //             this.setLabel(template[tIndex][0], i, -1);
        //         }
        //     }
        //     tIndex = 2 * i + 2;
        //     if (template[tIndex]) {
        //         if (template[tIndex][1] !== undefined) {
        //             this.setLine(template[tIndex][0], i, 0);
        //             this.setLine(template[tIndex][1], i, 1);
        //             this.setLine(template[tIndex][2], i, 2);
        //             this.setLine(template[tIndex][3], i, 3);
        //         }
        //         else {
        //             this.setLine(template[tIndex][0], i, -1);
        //         }
        //     }
        // }
        // if (template[13]) {
        //     this.setInOut(template[13][0]);
        // }

        // // wtf, why is this in this method? :D
        // SimVar.SetSimVarValue("L:AIRLINER_MCDU_CURRENT_FPLN_WAYPOINT", "number", this.currentFlightPlanWaypointIndex);
    }

    setLine(content, row, col = -1) {
        // if (col >= this._lineElements[row].length) {
        //     return;
        // }
        // if (!content) {
        //     content = "";
        // }
        // if (!this._lines[row]) {
        //     this._lines[row] = [];
        // }
        // if (col === -1) {
        //     for (let i = 0; i < this._lineElements[row].length; i++) {
        //         this._lines[row][i] = "";
        //         this._lineElements[row][i].textContent = "";
        //     }
        //     col = 0;
        // }
        // if (content === "__FMCSEPARATOR") {
        //     content = "------------------------";
        // }

        // let resultElems = [];

        // // TODO: think of a better way to reset classes from the default behavior
        // this._lineElements[row][col].classList.remove("white", "blue", "yellow", "green", "red");

        // if (content !== "") {
        //     if (content.includes("[color]")) {
        //         let color = content.split("[color]")[1];
        //         if (!color) {
        //             color = "white";
        //         }
        //         this._lineElements[row][col].classList.add(color);
        //         content = content.split("[color]")[0];

        //         let el = document.createElement("span");
        //         el.innerHTML = content;
        //         resultElems.push(el);
        //     } else {
        //         resultElems.push(...this.parseContent(content));
        //     }
        // }

        // // clear it (fastest)
        // this._lineElements[row][col].textContent = "";
        // resultElems.forEach(el => { this._lineElements[row][col].appendChild(el) });
        // this._lines[row][col] = this._lineElements[row][col].textContent;
    }

    setLabel(label, row, col = -1) {
        // if (col >= this._labelElements[row].length) {
        //     return;
        // }
        // if (!this._labels[row]) {
        //     this._labels[row] = [];
        // }
        // if (!label) {
        //     label = "";
        // }
        // if (col === -1) {
        //     for (let i = 0; i < this._labelElements[row].length; i++) {
        //         this._labels[row][i] = "";
        //         this._labelElements[row][i].textContent = "";
        //     }
        //     col = 0;
        // }
        // if (label === "__FMCSEPARATOR") {
        //     label = "------------------------";
        // }

        // let resultElems = [];

        // // TODO: think of a better way to reset classes from the default behavior
        // this._labelElements[row][col].classList.remove("white", "blue", "yellow", "green", "red");

        // if (label !== "") {
        //     if (label.includes("[color]")) {
        //         let color = label.split("[color]")[1];
        //         if (!color) {
        //             color = "white";
        //         }
        //         this._labelElements[row][col].classList.add(color);
        //         label = label.split("[color]")[0];

        //         let el = document.createElement("span");
        //         el.innerHTML = label;
        //         resultElems.push(el);
        //     } else {
        //         resultElems.push(...this.parseContent(label));
        //     }
        // }

        // // clear it (fastest)
        // this._labelElements[row][col].textContent = "";
        // resultElems.forEach(el => { this._labelElements[row][col].appendChild(el) });
        // this._labels[row][col] = this._labelElements[row][col].textContent;
    }

    setTitle3Head(content, col) {
        // let resultElems = [];

        // // TODO: think of a better way to reset classes from the default behavior
        // this._titleElement[col].classList.remove("white", "blue", "yellow", "green", "red");

        // if (content !== "") {
        //     if (content.includes("[color]")) {
        //         // use old styling logic
        //         let color = content.split("[color]")[1];
        //         if (!color) {
        //             color = "white";
        //         }
        //         this._title = content.split("[color]")[0];
        //         this._titleElement[col].classList.add(color);
        //         let el = document.createElement("span");
        //         el.innerHTML = this._title;
        //         resultElems.push(el);
        //     } else {
        //         resultElems.push(...this.parseContent(content));
        //     }
        // }

        // // clear it (fastest)
        // this._titleElement[col].textContent = "";
        // resultElems.forEach(el => { this._titleElement[col].appendChild(el) });
    }

    // for backwards compat
    setTitle(content) {
        // if (arguments.length > 1) {
        //     this.setTitle3Head(...arguments);
        //     return;
        // }

        // let color = content.split("[color]")[1];
        // if (!color) {
        //     color = "white";
        // }
        // this._title = content.split("[color]")[0];
        // this._titleElement[2].classList.remove("white", "blue", "yellow", "green", "red");
        // this._titleElement[2].classList.add(color);
        // this._titleElement[2].textContent = this._title;;
    }

    renderExec() {
        // let execEl = document.getElementById("exec-sign");
        // if (!execEl) {
        //     execEl = document.createElement("div");
        //     execEl.id = "exec-sign";
        //     execEl.innerHTML = "EXEC";
        //     execEl.classList.add("blackwhite", "line-right", "fitcontent", "hidden");
        //     document.getElementById("msg-line").append(execEl);
        // }

        // return execEl;
    }


    // "PRIVATE"

    // parses a template string and returns the elements array
    parseContent(content) {
        const resultElems = [];

        // if it starts with a bracket its probably empty
        if (content.startsWith("["))
            return resultElems;

        // eslint-disable-next-line no-useless-escape
        const rx = /([^\[\]\n]+)(\[[^\[\]\n]+\])*/g;
        let match = rx.exec(content);
        if (match) {
            while (match != null) {
                const el = document.createElement("span");

                diffAndSetText(el, match[1].replace("__LSB", "[").replace("__RSB", "]"));

                if (match[2]) {
                    // eslint-disable-next-line no-useless-escape
                    const classes = match[2].match(/[^\s\[\]]+/g);
                    classes.forEach(c => {
                        el.classList.add(c);
                    });
                }
                resultElems.push(el);
                match = rx.exec(content);
            }
        }
        return resultElems;
    }

    renderHeader() {
        // // triple header
        // let headerEl = document.getElementById("header");
        // headerEl.innerHTML = ""; // clear it
        // let tl = document.createElement("span");
        // tl.id = "title-left";
        // tl.classList.add("label-left")
        // headerEl.appendChild(tl);
        // let tr = document.createElement("span");
        // tr.id = "title-right";
        // tr.classList.add("label-right")
        // headerEl.appendChild(tr)
        // let tc = document.createElement("span");
        // tc.id = "title";
        // tc.classList.add("label-center")
        // headerEl.appendChild(tc)
        // this._titleElement = [];
        // this._titleElement.push(tl, tr, tc);
    }

    renderScratchpad() {
        // make footer accesible from css
        document.getElementById("in-out").parentElement.classList.add("footer");
        const inoutelem = document.getElementById("in-out");
        const brkOpen = document.createElement("span");
        brkOpen.innerHTML = "[";
        brkOpen.classList.add("blue", "line-left");
        const brkClose = document.createElement("span");
        brkClose.innerHTML = "]";
        brkClose.classList.add("blue", "line-right");
        inoutelem.parentElement.appendChild(brkOpen);
        inoutelem.parentElement.appendChild(brkClose);
    }

    renderMsgLine() {
        const lineEl = document.createElement("div");
        lineEl.id = "msg-line";
        lineEl.classList.add("line");
        document.getElementById("Electricity").append(lineEl);

        const msgEl = document.createElement("div");
        msgEl.classList.add("fitcontent", "line-left");
        lineEl.append(msgEl);

        return msgEl;
    }

    clearDisplay() {
        // let mainFrame = this.getChildById("Electricity");
        // // clear
        // this.generateHTMLLayout(mainFrame);
        const container = document.getElementById("wt_container");
        if (container) container.remove();
    }
}
