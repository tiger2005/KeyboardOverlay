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
  let useKps = false;
  let majorFontSize = 14;
  let tickSpeed = 10;
  let isReady = false;

  let directoryLocation = undefined;

  let useLockShortcut = false;
  let lockShortcutInfo = {};
  let useCleanShortcut = false;
  let cleanShortcutInfo = {};
  let useTouchShortcut = false;
  let touchShortcutInfo = {};

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
    $(`.tickDisplayer`).each(function(){
      tickRemoveEvent(Number($(this).attr("index")));
    });
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

  const cleanKeyboard = () => {
    for(var i in keyCounter)
      if(keyCounter.hasOwnProperty(i))
        keyCounter[i] = 0;
    currMaximum = 0;
    hitTotal = 0;
    if(keyHeatmap !== "none")
      $(`.buttonDiv`).each(function(){
          $(this).css("background", getColorFromPercent(0, keyHeatmap));
      });
    if(keyCount)
      $(`.buttonDiv > .counter`).each(function(){
          $(this).html(0);
      });
    $(".buttonCountDiv[type=total] > span").html("0");
  }

  let tickIndexToEvent = {};
  let animationEnd = {};
  let tickEventIndex = 0;
  const tickAddEvent = (idx) => {
    if(tickIndexToEvent[idx] === undefined)
      tickIndexToEvent[idx] = 0;
    if(tickIndexToEvent[idx] !== 0)
      return;
    const tkIdx = ++ tickEventIndex;
    tickIndexToEvent[idx] = tkIdx;
    let dom = $(`.tickDisplayer[index=${idx}]`);
    if(dom.hasClass("right")){
      let len = dom.width();
      let moveTime = len / (tickSpeed * majorFontSize);
      let ele = undefined;
      dom.append(`<div class='oneTick' id=${tkIdx} style="width: ${2 * len}px; transition: transform ${2 * moveTime}s linear; right: ${len}px; transform: translateX(0)"></div>`);
      var inv = setInterval(() => {
        ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
        if(ele.length >= 1)
          clearInterval(inv);
        else
          return;
        ele.css("transform", `translateX(${2 * len}px)`);
        setTimeout(() => {
          animationEnd[tkIdx] = true;
        }, moveTime * 1000);
      }, 20);
    }
    else if(dom.hasClass("left")){
      let len = dom.width();
      let moveTime = len / (tickSpeed * majorFontSize);
      let ele = undefined;
      dom.append((`<div class='oneTick' id=${tkIdx} style="width: ${2 * len}px; transition: transform ${2 * moveTime}s linear; left: ${len}px; transform: translateX(0)"></div>`));
      var inv = setInterval(() => {
        ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
        if(ele.length >= 1)
          clearInterval(inv);
        else
          return;
        ele.css("transform", `translateX(${-2 * len}px)`);
        setTimeout(() => {
          animationEnd[tkIdx] = true;
        }, moveTime * 1000);
      }, 20);
    }
    else if(dom.hasClass("down")){
      let len = dom.height();
      let moveTime = len / (tickSpeed * majorFontSize);
      let ele = undefined;
      dom.append((`<div class='oneTick' id=${tkIdx} style="height: ${2 * len}px; transition: transform ${2 * moveTime}s linear; bottom: ${len}px; transform: translateY(0)"></div>`));
      var inv = setInterval(() => {
        ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
        if(ele.length >= 1)
          clearInterval(inv);
        else
          return;
        ele.css("transform", `translateY(${2 * len}px)`);
        setTimeout(() => {
          animationEnd[tkIdx] = true;
        }, moveTime * 1000);
      }, 20);
    }
    else{
      let len = dom.height();
      let moveTime = len / (tickSpeed * majorFontSize);
      let ele = undefined;
      dom.append((`<div class='oneTick' id=${tkIdx} style="height: ${2 * len}px; transition: transform ${2 * moveTime}s linear; top: ${len}px; transform: translateY(0)"></div>`));
      var inv = setInterval(() => {
        ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
        if(ele.length >= 1)
          clearInterval(inv);
        else
          return;
        ele.css("transform", `translateY(${-2 * len}px)`);
        setTimeout(() => {
          animationEnd[tkIdx] = true;
        }, moveTime * 1000);
      }, 20);
    }
  };
  const tickRemoveEvent = (idx) => {
    if(tickIndexToEvent[idx] === 0 || tickIndexToEvent[idx] === undefined)
      return;
    let dom = $(`.tickDisplayer[index=${idx}]`);
    let tkIdx = tickIndexToEvent[idx];
    tickIndexToEvent[idx] = 0;
    let ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
    let inv = setInterval(() => {
      if(ele.length === 0)
        ele = $(`.tickDisplayer[index=${idx}] .oneTick[id=${tkIdx}]`);
      else {
        clearInterval(inv);
        if(dom.hasClass("right")){
          let len = dom.width();
          let moveTime = len / (tickSpeed * majorFontSize);
          if(animationEnd[tkIdx] === true){
            ele.remove();
            delete animationEnd[tkIdx];
            tkIdx = ++ tickEventIndex;
            dom.append(ele = $(`<div class='oneTick' id=${tkIdx} style="width: ${len}px; transition: transform ${moveTime}s linear; right: 0px"></div>`));
            setTimeout(() => {
              ele.css("transform", `translateX(${len}px)`);
              setTimeout(() => {
                ele.remove();
              }, moveTime * 1000);
            }, 20);
          }
          else{
            let p = ele.position().left;
            p = 2 * len + p;
            p += 0.05 * (moveTime * majorFontSize);
            p = Math.max(p, 4);
            ele.css("width", Math.ceil(p));
            setTimeout(() => {
              ele.css("width", Math.ceil(p));
            }, 20);
            setTimeout(() => {
              ele.remove();
              delete animationEnd[tkIdx];
            }, moveTime * 1000);
          }
        }
        else if(dom.hasClass("left")){
          let len = dom.width();
          let moveTime = len / (tickSpeed * majorFontSize);
          if(animationEnd[tkIdx] === true){
            ele.remove();
            delete animationEnd[tkIdx];
            tkIdx = ++ tickEventIndex;
            dom.append(ele = $(`<div class='oneTick' id=${tkIdx} style="width: ${len}px; transition: transform ${moveTime}s linear; left: 0px"></div>`));
            setTimeout(() => {
              ele.css("transform", `translateX(${-1 * len}px)`);
              setTimeout(() => {
                ele.remove();
              }, moveTime * 1000);
            }, 20);
          }
          else{
            let p = ele.position().left;
            p = len - p;
            p += 0.05 * (moveTime * majorFontSize);
            p = Math.max(p, 4);
            ele.css("width", Math.ceil(p));
            setTimeout(() => {
              ele.css("width", Math.ceil(p));
            }, 20);
            setTimeout(() => {
              ele.remove();
              delete animationEnd[tkIdx];
            }, moveTime * 1000);
          }
        }
        else if(dom.hasClass("down")){
          let len = dom.height();
          let moveTime = len / (tickSpeed * majorFontSize);
          if(animationEnd[tkIdx] === true){
            ele.remove();
            delete animationEnd[tkIdx];
            tkIdx = ++ tickEventIndex;
            dom.append(ele = $(`<div class='oneTick' id=${tkIdx} style="height: ${len}px; transition: transform ${moveTime}s linear; bottom: 0px"></div>`));
            setTimeout(() => {
              ele.css("transform", `translateY(${len}px)`);
              setTimeout(() => {
                ele.remove();
              }, moveTime * 1000);
            }, 20);
          }
          else{
            let p = ele.position().top;
            p = 2 * len + p;
            p += 0.05 * (moveTime * majorFontSize);
            p = Math.max(p, 4);
            ele.css("height", Math.ceil(p));
            setTimeout(() => {
              ele.css("height", Math.ceil(p));
            }, 20);
            setTimeout(() => {
              ele.remove();
              delete animationEnd[tkIdx];
            }, moveTime * 1000);
          }
        }
        else{
          let len = dom.height();
          let moveTime = len / (tickSpeed * majorFontSize);
          if(animationEnd[tkIdx] === true){
            ele.remove();
            delete animationEnd[tkIdx];
            tkIdx = ++ tickEventIndex;
            dom.append(ele = $(`<div class='oneTick' id=${tkIdx} style="height: ${len}px; transition: transform ${moveTime}s linear; top: 0px"></div>`));
            setTimeout(() => {
              ele.css("transform", `translateY(${-1 * len}px)`);
              setTimeout(() => {
                ele.remove();
              }, moveTime * 1000);
            }, 20);
          }
          else{
            let p = ele.position().top;
            p = len - p;
            p += 0.05 * (moveTime * majorFontSize);
            p = Math.max(p, 4);
            ele.css("height", Math.ceil(p));
            setTimeout(() => {
              ele.css("height", Math.ceil(p));
            }, 20);
            setTimeout(() => {
              ele.remove();
              delete animationEnd[tkIdx];
            }, moveTime * 1000);
          }
        }
      }
    }, 20);
  }

  let enableTouch = true;
  let touchTimeout = null;

  const toggleTouch = () => {
    $(".touchChange").removeClass("closed").addClass("open");
    if(touchTimeout == null)
      clearTimeout(touchTimeout);
    if(enableTouch === true){
      $(".touchChange").html(`<i class='fas fa-ban' style='color: red'></i>`);
      if(runInElectron)
        win.setIgnoreMouseEvents(true);
      touchTimeout = setTimeout(() => {
        $(".touchChange").removeClass("open").addClass("closed");
      }, 1000);
    }
    else{
      $(".touchChange").html(`<i class='fas fa-arrow-pointer' style='color: inherit'></i>`);
      if(runInElectron)
        win.setIgnoreMouseEvents(false);
      touchTimeout = setTimeout(() => {
        $(".touchChange").removeClass("open").addClass("closed");
      }, 1000);
    }
    enableTouch = ! enableTouch;
  }

  let hitMatrix = {};
  let hitTotal = 0;
  let cpsCount = 0;
  let keyboardLocked = false;
  const keydownEvent = (e, wheel) => {
    if(! isReady)
      return;
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
      if(useCleanShortcut) {
         var usage = true;
        if(typeof e === "string"){
          usage &= (false === cleanShortcutInfo.shiftKey);
          usage &= (false === cleanShortcutInfo.altKey);
          usage &= (false === cleanShortcutInfo.ctrlKey);
          usage &= (false === cleanShortcutInfo.metaKey);
        }
        else{
          usage &= (e.shiftKey === cleanShortcutInfo.shiftKey);
          usage &= (e.altKey === cleanShortcutInfo.altKey);
          usage &= (e.ctrlKey === cleanShortcutInfo.ctrlKey);
          usage &= (e.metaKey === cleanShortcutInfo.metaKey);
        }
        usage &= (p === cleanShortcutInfo.id.toUpperCase());
        if(usage)
          cleanKeyboard();
      }
      if(useTouchShortcut) {
        var usage = true;
        if(typeof e === "string"){
          usage &= (false === touchShortcutInfo.shiftKey);
          usage &= (false === touchShortcutInfo.altKey);
          usage &= (false === touchShortcutInfo.ctrlKey);
          usage &= (false === touchShortcutInfo.metaKey);
        }
        else{
          usage &= (e.shiftKey === touchShortcutInfo.shiftKey);
          usage &= (e.altKey === touchShortcutInfo.altKey);
          usage &= (e.ctrlKey === touchShortcutInfo.ctrlKey);
          usage &= (e.metaKey === touchShortcutInfo.metaKey);
        }
        usage &= (p === touchShortcutInfo.id.toUpperCase());
        if(usage)
          toggleTouch();
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
      $(".buttonCountDiv[type=total] > span").html(hitTotal);
      ++ cpsCount;
      if(toolBarMode === "tot")
        $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal);
      else if(useKps){
        if(toolBarMode === "kps")
          $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal + "<span style='position: absolute; top: 0px; right: 0px'>KPS " + cpsCount + "</span>");
        $(".buttonCountDiv[type=kps] > span").html(cpsCount);
        setTimeout(() => {
          -- cpsCount;
          if(toolBarMode === "kps")
            $(".debugInfo").html((keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL " + hitTotal + "<span style='position: absolute; top: 0px; right: 0px'>KPS " + cpsCount + "</span>");
          $(".buttonCountDiv[type=kps] > span").html(cpsCount);
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
    if(p !== undefined){
      $(`.buttonDiv[key=${keyIdMask(p)}]`).each(function(){
          $(this).addClass("clicked");
      });
      $(`.tickDisplayer[key=${keyIdMask(p)}]`).each(function(){
        tickAddEvent(Number($(this).attr("index")));
      });
    }
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
    if(useCleanShortcut) {
      var usage = true;
      if(typeof e === "string"){
        usage &= (false === cleanShortcutInfo.shiftKey);
        usage &= (false === cleanShortcutInfo.altKey);
        usage &= (false === cleanShortcutInfo.ctrlKey);
        usage &= (false === cleanShortcutInfo.metaKey);
      }
      else{
        usage &= (e.shiftKey === cleanShortcutInfo.shiftKey);
        usage &= (e.altKey === cleanShortcutInfo.altKey);
        usage &= (e.ctrlKey === cleanShortcutInfo.ctrlKey);
        usage &= (e.metaKey === cleanShortcutInfo.metaKey);
      }
      usage &= (p === cleanShortcutInfo.id.toUpperCase());
      if(usage)
        cleanKeyboard();
    }
    if(useTouchShortcut) {
      var usage = true;
      if(typeof e === "string"){
        usage &= (false === touchShortcutInfo.shiftKey);
        usage &= (false === touchShortcutInfo.altKey);
        usage &= (false === touchShortcutInfo.ctrlKey);
        usage &= (false === touchShortcutInfo.metaKey);
      }
      else{
        usage &= (e.shiftKey === touchShortcutInfo.shiftKey);
        usage &= (e.altKey === touchShortcutInfo.altKey);
        usage &= (e.ctrlKey === touchShortcutInfo.ctrlKey);
        usage &= (e.metaKey === touchShortcutInfo.metaKey);
      }
      usage &= (p === touchShortcutInfo.id.toUpperCase());
      if(usage)
        toggleTouch();
    }
  };
  const keyupEvent = (e, wheel) => {
    if(! isReady)
      return;
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
    if(p !== undefined){
      $(`.buttonDiv[key=${keyIdMask(p)}]`).each(function(){
          $(this).removeClass("clicked");
      });
      $(`.tickDisplayer[key=${keyIdMask(p)}]`).each(function(){
        tickRemoveEvent(Number($(this).attr("index")));
      });
    }
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
    if(directoryLocation !== undefined)
      x = x + "<br/>" + "Directory: /" + directoryLocation;
    errorMessage = true;
    $(".keyboardContainer").html(`<div style="display: flex; flex-direction: column; text-align: center; padding: 3px 5px; max-width: 300px;" class="buttonDiv">
      <i class='fas fa-circle-xmark' style="color: red; font-size: 1.5em;"></i>
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
    $(".touchChange").css("position", "absolute");
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
      url: "asserts/switch.json",
      async: false,
      success: function(d) {
        if(d.location !== undefined){
          d = d.location;
          if(typeof d !== "object" || !d.hasOwnProperty("length")){
            setErrorMessage("Directory location should be an array with strings.");
            return;
          }
          for(var i = 0; i < d.length; i++)
            if(typeof d[i] !== "string"){
              setErrorMessage("Directory location should be an array with strings.");
              return;
            }
          const bannedList = ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"];
          for(var i = 0; i < d.length; i++){
            var usage = true;
            for(var j = 0; j < bannedList.length; j++)
              usage &= (d[i].indexOf(bannedList[j]) === -1);
            if(!usage){
              setErrorMessage("Unexpected character found in location(s)");
            }
          }
          directoryLocation = "";
          for(var i = 0; i < d.length; i++)
            directoryLocation += (d[i] + "/");
        }
        else {
          setErrorMessage("Cannot get directory location option.");
        }
      },
      error: function() {
        directoryLocation = "";
      }
    });

    if(errorMessage)
      return;

    $.ajax({
      url: `asserts/${directoryLocation}options.json`,
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
        if(data.tickBackgroundColor !== undefined)
          document.documentElement.style.setProperty("--tick-background", data.tickBackgroundColor);
        if(typeof data.fontSize === "number")
          document.documentElement.style.setProperty("--font-size", data.fontSize + "px"), majorFontSize = data.fontSize;
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
        if(typeof(data.toolBarMode) === "string" && (data.toolBarMode === "none" || data.toolBarMode === "debug" || data.toolBarMode === "kps" || data.toolBarMode === "tot"))
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
        if(data.superTopLevel === true && runInElectron)
          ipcRenderer.send("window-super-top");
        if(typeof data.bounceTime === "number")
          document.documentElement.style.setProperty("--bounce-time", data.bounceTime + "ms");
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
        if(typeof data.cleanShortcut === "object" && !data.cleanShortcut.hasOwnProperty("length")){
          if(typeof data.cleanShortcut.id !== "string"
          || typeof data.cleanShortcut.shiftKey !== "boolean"
          || typeof data.cleanShortcut.ctrlKey !== "boolean"
          || typeof data.cleanShortcut.altKey !== "boolean"
          || typeof data.cleanShortcut.metaKey !== "boolean"
          ){
            setErrorMessage("Clean shortcut options not correct.");
            return;
          }
          useCleanShortcut = true;
          cleanShortcutInfo = data.cleanShortcut;
        }
        if(typeof data.touchShortcut === "object" && !data.touchShortcut.hasOwnProperty("length")){
          if(typeof data.touchShortcut.id !== "string"
          || typeof data.touchShortcut.shiftKey !== "boolean"
          || typeof data.touchShortcut.ctrlKey !== "boolean"
          || typeof data.touchShortcut.altKey !== "boolean"
          || typeof data.touchShortcut.metaKey !== "boolean"
          ){
            setErrorMessage("Touch shortcut options not correct.");
            return;
          }
          useTouchShortcut = true;
          touchShortcutInfo = data.touchShortcut;
        }
        if(typeof(data.tickSpeed) === "number")
          tickSpeed = data.tickSpeed <= 0 ? 10 : data.tickSpeed;
      },
      error: function(){
        setErrorMessage("Cannot load options.");
      }
    });

    if(toolBarMode === "kps")
      useKps = true;

    if(errorMessage)
      return;

    $.ajax({
      url: (runInElectron ? `asserts/${directoryLocation}bindings.json` : `asserts/${directoryLocation}bindings_web.json`),
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
      url: `asserts/${directoryLocation}icons.json`,
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
      url: `asserts/${directoryLocation}map.txt`,
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
        var tickIndex = 0;
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
            else if(dt[0] == '<Kps>'){
              var wd = getNum(dt[1]);
              var ht = getNum(dt[2]);
              var ft = getNum(dt[3]);
              res += `<div class="buttonCountDiv" type="kps" height=${ht} width=${wd} font=${ft}><div class='keyBg'><i class='fas fa-stopwatch'></i></div><span>0</span></div>`;
              useKps = true;
            }
            else if(dt[0] == '<Total>'){
              var wd = getNum(dt[1]);
              var ht = getNum(dt[2]);
              var ft = getNum(dt[3]);
              res += `<div class="buttonCountDiv" type="total" height=${ht} width=${wd} font=${ft}><div class='keyBg'><i class='fas fa-keyboard'></i></div><span>0</span></div>`;
            }
            else if(dt[0] === "<Tick>"){
              if(dt.length === 1){
                setErrorMessage('Missing argument at statement ' + statementId + ".");
                return;
              }
              var cnt = dt[1].toUpperCase();
              if(idToKey[cnt] === undefined){
                setErrorMessage("Cannot find key of id \"" + allHtmlSpecialChars(dt[1]) + '\" at statement ' + statementId + ".");
                return;
              }
              var direction = dt[2];
              if(direction === undefined)
                direction = "right";
              if(["up", "down", "left", "right"].indexOf(direction) === -1){
                setErrorMessage('Unexpected direction at statement ' + statementId + ".");
                return;
              }
              var wd = getNum(dt[3]);
              var ht = getNum(dt[4]);
              var ft = getNum(dt[5]);
              res += `<div class="tickDisplayer ${direction}" index="${++ tickIndex}" key="${keyIdMask(cnt)}" height=${ht} width=${wd} font=${ft}><div class='tickMark'></div></div>`;
              keyCounter[cnt] = 0;
            }
            else if(dt[0] === "<TickText>"){
              if(dt.length === 1){
                setErrorMessage('Missing argument at statement ' + statementId + ".");
                return;
              }
              var cnt = dt[1].toUpperCase();
              if(idToKey[cnt] === undefined){
                setErrorMessage("Cannot find key of id \"" + allHtmlSpecialChars(dt[1]) + '\" at statement ' + statementId + ".");
                return;
              }
              var direction = dt[2];
              if(direction === undefined)
                direction = "right";
              if(["up", "down", "left", "right"].indexOf(direction) === -1){
                setErrorMessage('Unexpected direction at statement ' + statementId + ".");
                return;
              }
              var wd = getNum(dt[3]);
              var ht = getNum(dt[4]);
              var ft = getNum(dt[5]);
              res += `<div class="tickDisplayer ${direction}" index="${++ tickIndex}" key="${keyIdMask(cnt)}" height=${ht} width=${wd} font=${ft}><div class='tickMark'><span>${idToKey[cnt].name}</span></div></div>`;
              keyCounter[cnt] = 0;
            }
            else if(dt[0] === "<TickIcon>"){
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
              var direction = dt[2];
              if(direction === undefined)
                direction = "right";
              if(["up", "down", "left", "right"].indexOf(direction) === -1){
                setErrorMessage('Unexpected direction at statement ' + statementId + ".");
                return;
              }
              var wd = getNum(dt[3]);
              var ht = getNum(dt[4]);
              var ft = getNum(dt[5]);
              res += `<div class="tickDisplayer ${direction}" index="${++ tickIndex}" key="${keyIdMask(cnt)}" height=${ht} width=${wd} font=${ft}><div class='tickMark'><span>${icons[cnt]}</span></div></div>`;
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
            (toolBarMode === "kps" ? (keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL 0<span style='position: absolute; top: 0px; right: 0px'>KPS 0</span>" : (toolBarMode === "tot" ? (keyTotalCountMode === "normal" ? "" : "S-") + "TOTAL 0" : "DEBUG INFO"))
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
        $(".buttonCountDiv").each(function(){
          $(this).attr("style", getScaleStyle(
            Number($(this).attr("width")),
            Number($(this).attr("height")),
            Number($(this).attr("font")),
            false)
          );
        });
        $(".tickDisplayer").each(function(){
          $(this).attr("style", getScaleStyle(
            Number($(this).attr("width")),
            Number($(this).attr("height")),
            Number($(this).attr("font")),
            false)
          );
        });
        if(displayShortcut)
          $(".shortcutKeyContainer").css("display", "block");
        if(runInElectron)
          win.setSize(Math.floor($(".innerContent").outerWidth()), Math.floor($(".innerContent").outerHeight()));
        isReady = true;
      },
      error: function(){
        setErrorMessage("Cannot load map file.");
      }
    });
    // setTimeout(refreshOverallInfo, refreshTime);
  };
  refreshOverallInfo();
})();