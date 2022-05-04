(() => {
  let tmpList = [];
  var keys = [];
  var idToKey = {};
  var icons = {};
  var upperKeySet = [];
  var upperIf = false;
  var shiftOnEnter = 0;
  let codeToKey = {};
  let win = {};
  if(runInElectron)
    win = require('electron').remote.getCurrentWindow();
  let refreshTime = 10 * 1000;
  let toolBarMode = "none";
  let errorMessage = false;
  let keyCount = false;
  let keyHeatmap = "none";
  let keyTotalCountMode = "normal";
  let keyMaskList = {}, keyMaskLength = 0;
  let keyCounter = {};
  let displayShortcut = false;
  let clickedSwicher = {};

  let useLockShortcut = false;
  let lockShortcutInfo = {};

  const keyIdMask = (x) => {
    if(keyMaskList[x] !== undefined)
      return keyMaskList[x];
    ++ keyMaskLength;
    keyMaskList[x] = keyMaskLength;
    return keyMaskLength;
  }

  const flushShift = (e) => {
    e &= (shiftOnEnter !== 0);
    if(upperIf === e)
      return;
    upperIf = e;
    for(var i = 0; i < upperKeySet.length; i ++)
      $(`.buttonDiv[key=${keyIdMask(upperKeySet[i].id.toUpperCase())}] > span:first-child`).html(upperIf ? upperKeySet[i].upperKey : upperKeySet[i].name);
  };

  const getColorFromPercent = (x, opa) => {
    let r = 0, g = 0, b = 0;
    let rr = 82, gg = 196, bb = 26;
    let rrr = 231, ggg = 76, bbb = 60;
    // if(x < 0.5){
    //  r = 255;
    //  g = one * x;
    // }
    // else{
    //  r = 255 - ((x - 0.5) * one);
    //  g = 255;
    // }
    r = rr + (rrr - rr) * x;
    g = gg + (ggg - gg) * x;
    b = bb + (bbb - bb) * x;
    if(opa < 0){
      r += (255 - r) * (- opa);
      g += (255 - g) * (- opa);
      b += (255 - b) * (- opa);
    }
    else{
      r = r * (1 - opa);
      g = g * (1 - opa);
      b = b * (1 - opa);
    }
    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);
    return `rgb(${r}, ${g}, ${b})`;
  };

  let currMaximum = 0;
  const flushHeatmap = (x) => {
    if(keyCounter[x] <= currMaximum){
      $(`.buttonDiv[key=${keyIdMask(x)}]`).each(function(){
          $(this).css("background", getColorFromPercent(keyCounter[x] / currMaximum, keyHeatmap));
      });
    }
    else{
      currMaximum = keyCounter[x];
      for(let i in keyCounter)
        if(keyCounter.hasOwnProperty(i)){
          $(`.buttonDiv[key=${keyIdMask(i)}]`).each(function(){
              $(this).css("background", getColorFromPercent(keyCounter[i] / currMaximum, keyHeatmap));
          });
        }
    }
  }

  const lockKeyboard = (silent) => {
    keyboardLocked = true;
    $(".lockContainer").css("width", "calc(50% + 20px)");
    $(".windowCloser").css("transform", "scale(0.0)");
    $(".lockerMask").removeClass("closed").addClass("open");
    $(".innerContent").addClass("addBlur");
    hitMatrix = {};
    $(".buttonDiv").removeClass("clicked");
    if(!silent && runInElectron) {
      let option = {
        title: "The keyboard had been locked!",
        body: "Click here to unlock."
      };
      let hhwNotication = new window.Notification(option.title, option);
      hhwNotication.onclick = () => {
        unlockKeyboard(false);
      }
    }
  }

  const unlockKeyboard = (silent) => {
    keyboardLocked = false;
    $(".lockContainer").css("width", "calc(50% + 8px)");
    $(".windowCloser").css("transform", "scale(1.0)");
    $(".lockerMask").removeClass("open").addClass("closed");
    $(".innerContent").removeClass("addBlur");
    if(!silent && runInElectron) {
      let option = {
        title: "The keyboard had been unlocked!",
        body: "Click here to lock again."
      };
      let hhwNotication = new window.Notification(option.title, option);
      hhwNotication.onclick = () => {
        lockKeyboard(false);
      }
    }
  }

  let hitMatrix = {};
  let hitTotal = 0;
  let cpsCount = 0;
  let keyboardLocked = false;
  const keydownEvent = (e, wheel) => {
    const ck = (typeof e === "string" ? e : (runInElectron ? e.keycode : e.code));
    if(keyboardLocked){
      if(codeToKey[ck] === undefined)
        return;
      let p = codeToKey[ck].id.toUpperCase();
      if(useLockShortcut) {
        var usage = true;
        if(typeof e === "string"){
          usage &= (false === lockShortcutInfo.shiftKey);
          usage &= (false === lockShortcutInfo.altKey);
          usage &= (false === lockShortcutInfo.ctrlKey);
          usage &= (false === lockShortcutInfo.metaKey);
        }
        else{
          usage &= (e.shiftKey === lockShortcutInfo.shiftKey);
          usage &= (e.altKey === lockShortcutInfo.altKey);
          usage &= (e.ctrlKey === lockShortcutInfo.ctrlKey);
          usage &= (e.metaKey === lockShortcutInfo.metaKey);
        }
        usage &= (p === lockShortcutInfo.id.toUpperCase());
        if(usage)
          unlockKeyboard(false);
      }
      return;
    }
    if(toolBarMode === "debug")
      $(".debugInfo").html("<i class='fas fa-turn-down'></i> #" + ck);
    if(codeToKey[ck] === undefined)
      return;
    if(hitMatrix[ck] === undefined)
      hitMatrix[ck] = 0;
    if(++ hitMatrix[ck] > 1){
      if(displayShortcut && codeToKey[ck].mouse !== true){
        $(".shortcutKeyContainer > div > span.combo").remove();
        $(".shortcutKeyContainer > div").append(`<span class='combo'> x${hitMatrix[ck]}</span>`);
      }
      if(toolBarMode === "debug")
        $(".debugInfo").html("<i class='fas fa-turn-down'></i> #" + ck + " (" + (hitMatrix[ck] + 1) + "x)");
      return;
    }
    if(codeToKey[ck].switch === "Shift")
      ++ shiftOnEnter;
    let p = codeToKey[ck].id.toUpperCase();
    if((keyTotalCountMode === "normal" || keyCounter[p] !== undefined) && wheel !== true){
      ++ hitTotal;
      ++ cpsCount;
      if(toolBarMode === "tot")
        $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal);
      else if(toolBarMode === "cps"){
        $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal + "<span style='position: absolute; top: 0px; right: 0px'>CPS " + cpsCount + "</span>");
        setTimeout(() => {
          -- cpsCount;
          $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal + "<span style='position: absolute; top: 0px; right: 0px'>CPS " + cpsCount + "</span>");
        }, 1000);
      }
    }
    flushShift(e.shiftKey);
    if(keyCounter[p] !== undefined){
      ++ keyCounter[p];
      if(keyCount)
        $(`.buttonDiv[key=${keyIdMask(p)}] > .counter`).each(function(){
            $(this).html(keyCounter[p]);
        });
      if(keyHeatmap !== "none")
        flushHeatmap(p);
    }
    if(p !== undefined)
      $(`.buttonDiv[key=${keyIdMask(p)}]`).each(function(){
          $(this).addClass("clicked");
      });
    if(displayShortcut && codeToKey[ck].mouse !== true){
      let q = codeToKey[ck];
      if(q.switch !== undefined){
        if(clickedSwicher[q.switch] === undefined)
          clickedSwicher[q.switch] = 0;
        ++ clickedSwicher[q.switch];
      }
      $(".shortcutKeyContainer").html("");
      let ls = $("<div class='shortcutKeyFlex'></div>");
      for(let x in clickedSwicher)
        if(clickedSwicher.hasOwnProperty(x) && clickedSwicher[x] !== 0)
          ls.append(`<div class='buttonDivCpoy'>${x}</div>`);
      if(q.switch === undefined)
        ls.append(`<div class='buttonDivCpoy'>${q.name}</div>`);
      $(".shortcutKeyContainer").append(ls);
    }
    if(useLockShortcut) {
      var usage = true;
      if(typeof e === "string"){
        usage &= (false === lockShortcutInfo.shiftKey);
        usage &= (false === lockShortcutInfo.altKey);
        usage &= (false === lockShortcutInfo.ctrlKey);
        usage &= (false === lockShortcutInfo.metaKey);
      }
      else{
        usage &= (e.shiftKey === lockShortcutInfo.shiftKey);
        usage &= (e.altKey === lockShortcutInfo.altKey);
        usage &= (e.ctrlKey === lockShortcutInfo.ctrlKey);
        usage &= (e.metaKey === lockShortcutInfo.metaKey);
      }
      usage &= (p === lockShortcutInfo.id.toUpperCase());
      if(usage)
        lockKeyboard(false);
    }
  };
  const keyupEvent = (e, wheel) => {
    if(keyboardLocked)
      return;
    const ck = (typeof e === "string" ? e : (runInElectron ? e.keycode : e.code));
    hitMatrix[ck] = 0;
    if(toolBarMode === "debug")
      $(".debugInfo").html("<i class='fas fa-turn-up'/></i> #" + ck);
    if(codeToKey[ck] === undefined)
      return;
    if(codeToKey[ck].switch === "Shift")
      shiftOnEnter = Math.max(shiftOnEnter - 1, 0);
    flushShift(e.shiftKey);
    let p = codeToKey[ck].id.toUpperCase();
    if(p !== undefined)
      $(`.buttonDiv[key=${keyIdMask(p)}]`).each(function(){
          $(this).removeClass("clicked");
      });
    if(displayShortcut && codeToKey[ck].mouse !== true){
      let q = codeToKey[ck];
      if(q.switch !== undefined){
        if(clickedSwicher[q.switch] === undefined)
          clickedSwicher[q.switch] = 0;
        clickedSwicher[q.switch] = Math.max(0, clickedSwicher[q.switch] - 1);
      }
    }
  };

  const mouseDownEvent = (e) => {
    if(e.button === 1)
      keydownEvent("LeftClick");
    if(e.button === 2)
      keydownEvent("RightClick");
    if(e.button === 3)
      keydownEvent("MiddleClick");
  };

  const mouseUpEvent = (e) => {
    if(e.button === 1)
      keyupEvent("LeftClick");
    if(e.button === 2)
      keyupEvent("RightClick");
    if(e.button === 3)
      keyupEvent("MiddleClick");
  };

  const keypressEvent = (x) => {
    keydownEvent(x, true);
    setTimeout(() => {
      keyupEvent(x, true);
    }, 100);
  }

  const mouseWheelEvent = (e) => {
    if(e.rotation < 0)
      keypressEvent("WheelForward");
    else
      keypressEvent("WheelBackward");
  };

  const setErrorMessage = (x) => {
    errorMessage = true;
    $(".keyboardContainer").html(`<div style="display: flex; flex-direction: column; text-align: center; padding: 3px 5px;" class="buttonDiv">
      <i class='fas fa-circle-xmark' style="color: red; font-size: 1.5em"></i>
      <span style="color: var(--key-font-color)">${x}</span>
    </div>`);
    if(runInElectron){
        win.setSize(Math.ceil($(".keyboardContainer").outerWidth()), Math.ceil($(".keyboardContainer").outerHeight()));
    }
  };

  if(runInElectron){
    let ioHook = undefined;
    try {
      ioHook = require("iohook");
    }
    catch(error) {
      setErrorMessage("Cannot use iohook library.");
    }
    if(errorMessage)
      return;
    ioHook.useRawcode(false);
    ioHook.start(false);
    ioHook.on("keydown", keydownEvent);
    ioHook.on("keyup", keyupEvent);
    ioHook.on("mousedown", mouseDownEvent);
    ioHook.on("mouseup", mouseUpEvent);
    ioHook.on("mousewheel", mouseWheelEvent);
    win.on(`before-quit`, () => {
      ioHook.unload();
      ioHook.stop();
      ipcRenderer.send('window-close');
    });
  }
  else{
    $("body").addClass("at_desktop");
    $(".innerContent").css("position", "relative");
    $(".lockerMask").css("position", "absolute");
    $("html").keydown(keydownEvent);
    $("html").keyup(keyupEvent);
    $("html").bind("mousedown", (e) => {
      e.stopPropagation();
      if(e.which === 1)
        keydownEvent("LeftClick");
      if(e.which === 2)
        keydownEvent("MiddleClick");
      if(e.which === 3)
        keydownEvent("RightClick");
    });
    $("html").bind("mouseup", (e) => {
      e.stopPropagation();
      if(e.which === 1)
        keyupEvent("LeftClick");
      if(e.which === 2)
        keyupEvent("MiddleClick");
      if(e.which === 3)
        keyupEvent("RightClick");
    });
    $("html").on("mousewheel", (e) => {
      if(e.deltaY > 0)
        keypressEvent("WheelForward");
      else
        keypressEvent("WheelBackward");
    })
  }

  if(errorMessage)
    return;

  $(".lockerMask i").eq(0).click(function() {
    if(! keyboardLocked)
      lockKeyboard(true);
    else 
      unlockKeyboard(true);
  })

  $(".lockerMask i").eq(1).click(function() {
    if (runInElectron)
      ipcRenderer.send("window-close");
  })

  const refreshOverallInfo = () => {
    $.ajax({
      url: "asserts/options.json",
      async: false,
      success: function(data){
        if(typeof data !== "object"){
          setErrorMessage("Cannot load options.");
          return;
        }
        if(data.backgroundColor !== undefined)
          document.documentElement.style.setProperty("--background-color", data.backgroundColor);
        if(data.keyBackgroundColor !== undefined)
          document.documentElement.style.setProperty("--key-background-color", data.keyBackgroundColor);
        if(data.keyFontColor !== undefined)
          document.documentElement.style.setProperty("--key-font-color", data.keyFontColor);
        if(data.keyShadowColor !== undefined)
          document.documentElement.style.setProperty("--key-shadow-color", data.keyShadowColor)
        if(data.keyActiveBackgroundColor !== undefined)
          document.documentElement.style.setProperty("--key-active-background-color", data.keyActiveBackgroundColor);
        if(data.keyActiveFontColor !== undefined)
          document.documentElement.style.setProperty("--key-active-font-color", data.keyActiveFontColor);
        if(typeof data.fontSize === "number")
          document.documentElement.style.setProperty("--font-size", data.fontSize + "px");
        if(data.fontFamily !== undefined)
          document.documentElement.style.setProperty("--font-family", data.fontFamily);
        if(typeof data.toolBarFontSize === "number")
          document.documentElement.style.setProperty("--tool-bar-font-size", data.toolBarFontSize + "px");
        if(typeof(data.alwaysOnTop) === "boolean" && data.alwaysOnTop === false)
          win.setAlwaysOnTop(false);
        if(typeof(data.refreshTime) === "number")
          refreshTime = data.refreshTime;
        if((typeof(data.keyHeatmap) === "string" && (data.keyHeatmap === "none" || data.keyHeatmap === "light" || data.keyHeatmap === "dark")) || typeof data.keyHeatmap === "number"){
          if(data.keyHeatmap === "none")
              keyHeatmap = "none";
          else
            keyHeatmap = (data.keyHeatmap === "light" ? -0.5 : (data.keyHeatmap === "dark" ? 0.4 : Math.max(-1, Math.min(1, data.keyHeatmap))));
        }
        if(typeof(data.toolBarMode) === "string" && (data.toolBarMode === "none" || data.toolBarMode === "debug" || data.toolBarMode === "cps" || data.toolBarMode === "tot"))
          toolBarMode = data.toolBarMode;
        if(typeof(data.keyTotalCountMode) === "string" && (data.keyTotalCountMode === "normal" || data.keyTotalCountMode === "strict"))
          keyTotalCountMode = data.keyTotalCountMode;
        if(typeof data.keyCount === "boolean")
          keyCount = data.keyCount;
        if(typeof data.displayShortcut === "boolean")
          displayShortcut = data.displayShortcut;
        if(data.antiMinimize === true) {
          win.on('minimize', () => {
            win.restore();
          })
        }
        if(typeof data.bounceTime === "number")
          document.documentElement.style.setProperty("--bounce-time", data.bounceTime + "ms");
        // if(typeof data.upgradeTopLevel === boolean
        //   && data.upgradeTopLevel === true
        //   && data.alwaysOnTop === true){
        //   if(runInElectron)
        //     ipcRenderer.send("window-top-level");
        // }
        if(typeof data.lockShortcut === "object" && !data.lockShortcut.hasOwnProperty("length")){
          if(typeof data.lockShortcut.id !== "string"
          || typeof data.lockShortcut.shiftKey !== "boolean"
          || typeof data.lockShortcut.ctrlKey !== "boolean"
          || typeof data.lockShortcut.altKey !== "boolean"
          || typeof data.lockShortcut.metaKey !== "boolean"
          ){
            setErrorMessage("Lock shortcut options not correct.");
            return;
          }
          useLockShortcut = true;
          lockShortcutInfo = data.lockShortcut;
        }
      },
      error: function(){
        setErrorMessage("Cannot load options.");
      }
    });

    if(errorMessage)
      return;

    $.ajax({
      url: (runInElectron ? "asserts/bindings.json" : "asserts/bindings_web.json"),
      async: false,
      success: function(data){
        if(typeof data !== "object" || ! data.hasOwnProperty("length")){
          setErrorMessage("Key binding list should be an array.");
          return;
        }
        keys = data;
        codeToKey = {};
        for(var i = 0; i < keys.length; i++){
          if(typeof keys[i].id !== "string"){
            setErrorMessage("Cannot get id from key no. " + (i + 1) + ".");
            return;
          }
          if(typeof keys[i].name !== "string"){
            setErrorMessage("Cannot get name from key no. " + (i + 1) + ".");
            return;
          }
          if(typeof keys[i].code !== "number" && typeof keys[i].code !== "string" && (typeof keys[i].code !== "object" || ! keys[i].code.hasOwnProperty("length"))){
            setErrorMessage("Cannot get code from key no. " + (i + 1) + ".");
            return;
          }
          if(keys[i].name === "")
            keys[i].name = "&nbsp;";
          idToKey[keys[i].id.toUpperCase()] = keys[i];
          if(typeof keys[i].code === "number" || typeof keys[i].code === "string")
            codeToKey[keys[i].code] = keys[i];
          else
            for(var j = 0; j < keys[i].code.length; j ++)
              codeToKey[keys[i].code[j]] = keys[i];
          if(typeof keys[i].upperKey === "string"){
            if(keys[i].upperKey === "")
              keys[i].upperKey = "&nbsp;";
            upperKeySet.push(keys[i]);
          }
        }
      },
      error: function() {
        setErrorMessage("Cannot load key binding list.");
      }
    });

    if(errorMessage)
      return;

    $.ajax({
      url: "asserts/icons.json",
      async: false,
      success: function(data){
        if(typeof data !== "object"){
          setErrorMessage("Icon list should be an object.")
        }
        icons = {};
        for(var i in data)
          if(data.hasOwnProperty(i)){
            if(typeof data[i] !== "string"){
              setErrorMessage("Icon of \"" + i + "\" should be a string.");
            }
            icons[i.toUpperCase()] = data[i];
          }
      },
      error: function(){
        setErrorMessage("Cannot load icon list.");
      }
    });

    if(errorMessage)
      return;

    function allHtmlSpecialChars(text){
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;',
        '\\': '\\\\'
      };
      return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    $.ajax({
      url: "asserts/map.txt",
      async: false,
      success: function(data) {
        var res = "";
        data = $.trim(data).split("\n");
        const getNum = (x) => {
          if(x == undefined)
            return 1;
          x = Number(x);
          if(x == NaN || x == undefined)
            return 1.0;
          return x;
        }
        var statementId = 0;
        var bracketList = [];
        for(var i = 0; i < data.length; i ++){
          var p = data[i].split("\r");
          for(var j = 0; j < p.length; j ++){
            var dt = p[j];
            dt = $.trim(dt);
            if(dt == "")
              continue;
            dt = dt.split(" ");
            var newL = dt; dt = [];
            for(let k = 0; k < newL.length; k ++)
              if(newL[k].length != 0)
                dt.push(newL[k]);
            ++ statementId;
            if(dt[0] == "<Row>")
              res += `<div style="display: flex; flex-direction: row">`, bracketList.push([statementId, "Row"]);
            else if(dt[0] == "</Row>"){
              if(bracketList.length === 0 || bracketList.pop()[1] !== "Row"){
                setErrorMessage("Unexpected &lt;/Row&gt; at statement " + statementId + ".");
                return;
              }
              res += `</div>`;
            }
            else if(dt[0] == "<Column>")
              res += `<div style="display: flex; flex-direction: column">`, bracketList.push([statementId, "Column"]);
            else if(dt[0] == "</Column>"){
              if(bracketList.length === 0 || bracketList.pop()[1] !== "Column"){
                setErrorMessage("Unexpected &lt;/Column&gt; at statement " + statementId + ".");
                return;
              }
              res += `</div>`;
            }
            else if(dt[0] == "<Blank>"){
              var l = getNum(dt[1]);
              var r = getNum(dt[2]);
              res += `<div style='width: ${2.2 * l}em; height: ${2.2 * r}em;'></div>`;
            }
            else if(dt[0] == '<Button>'){
              if(dt.length === 1){
                setErrorMessage('Missing argument at statement ' + statementId + ".");
                return;
              }
              var cnt = dt[1].toUpperCase();
              if(idToKey[cnt] === undefined){
                setErrorMessage("Cannot find key of id \"" + allHtmlSpecialChars(dt[1]) + '\" at statement ' + statementId + ".");
                return;
              }
              var wd = getNum(dt[2]);
              var ht = getNum(dt[3]);
              var ft = getNum(dt[4]);
              res += `<div class="buttonDiv" key="${keyIdMask(cnt)}" height=${ht} width=${wd} font=${ft}><span>${idToKey[cnt].name}</span>${keyCount ? "<span class='counter'>0</span>" : ""}</div>`;
              keyCounter[cnt] = 0;
            }
            else if(dt[0] == "<Icon>"){
              if(dt.length === 1){
                setErrorMessage('Missing argument at statement ' + statementId + ".");
                return;
              }
              var cnt = dt[1].toUpperCase();
              if(idToKey[cnt] === undefined){
                setErrorMessage("Cannot find key of id \"" + allHtmlSpecialChars(dt[1]) + '\" at statement ' + statementId + ".");
                return;
              }
              if(icons[cnt] === undefined){
                setErrorMessage("Cannot find icon of id \"" + allHtmlSpecialChars(dt[1]) + '\" at statement ' + statementId + ".");
                return;
              }
              var wd = getNum(dt[2]);
              var ht = getNum(dt[3]);
              var ft = getNum(dt[4]);
              res += `<div class="buttonDiv" key="${keyIdMask(cnt)}" height=${ht} width=${wd} font=${ft}><span>${icons[cnt]}</span>${keyCount ? "<span class='counter'>0</span>" : ""}</div>`;
              keyCounter[cnt] = 0;
            }
            else if(dt[0] === undefined){
              setErrorMessage("Unknown token at statement " + statementId + ".");
              return;
            }
            else {
              setErrorMessage("Unknown token\"" + allHtmlSpecialChars(dt[0]) + '\" at statement ' + statementId + ".");
              return;
            }
          }
        }
        if(bracketList.length !== 0){
          setErrorMessage("Unexpected EOF - cannot match brackets.");
          return;
        }
        $(".keyboardContainer").html("<div style='margin-bottom: 2px; overflow: visible'>"
          + (toolBarMode === "none" ? "" : "<div class='debugInfo'>" + 
            (toolBarMode === "cps" ? (keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL 0<span style='position: absolute; top: 0px; right: 0px'>CPS 0</span>" : (toolBarMode === "tot" ? (keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL 0" : "DEBUG INFO"))
          + "</div>")
          + res
          + "</div>");
        $(".buttonDiv").each(function(){
          $(this).attr("style", getScaleStyle(
            Number($(this).attr("width")),
            Number($(this).attr("height")),
            Number($(this).attr("font")),
            keyCount)
          );
          if(keyHeatmap !== "none")
            $(this).css("background", getColorFromPercent(0, keyHeatmap));
        });
        if(displayShortcut)
          $(".shortcutKeyContainer").css("display", "block");
        if(runInElectron)
          win.setSize(Math.ceil($(".innerContent").outerWidth()), Math.ceil($(".innerContent").outerHeight()));
      },
      error: function(){
        setErrorMessage("Cannot load map file.");
      }
    });
    // setTimeout(refreshOverallInfo, refreshTime);
  };
  refreshOverallInfo();
})();