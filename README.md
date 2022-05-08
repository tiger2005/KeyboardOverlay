# KeyboardOverlay

A highly customizable keyboard displayer, including shortcut keys, key count, kps display and so on.

[中文介绍](https://github.com/tiger2005/KeyboardOverlay/blob/main/README-zh_cn.md)

![RP53DLI5_NW`W21O4VM_PT6.png](https://s2.loli.net/2022/05/02/mldJFwyZ9aDzGCn.png)

This is an example keyboard overlay, using map in windows-80.txt, kps mode and shortcut key display. The font family is "Config".

This project is developed by Electron. It requires ioHook to capture global keyboard & mouse events, and FontAwesome v6 for icon library.

Thanks @YuzhenQin for adding Github Actions. Now you can straightly download releases from Github.

## Preview

You can preview the project on https://tiger2005.github.io/KeyboardOverlay/ .

If you've downloaded the source code of the project, you can preview the keyboard **without installing the project**. We added web browser support for Keyboard Overlay, and you can open a Live Server or upload onto your server.

If you've downloaded the release, the source code directory is `/resources/app/`, and you can do the same thing as above.

## Usage

You can straightly download zip file from Github releases, unzip on your computer and open the executive file at the root of the zip file. Here's the way to run by source code:

1. Download the source code of this project to your computer.

2. At the root of the project, run `npm install` to install all the modules required.

3. Go to `/node_modules/iohook`, and run the following command (same as `rebuildnew` command in `/package.json`) 

```
npm rebuild --runtime=electron --target=12.0.0 --disturl=https://atom.io/download/atom-shell --abi=87
```

This command will add a folder `/node_modules/iohook/builds`, with pre-build files of iohook in it.

4. Go back to the root of the project, and run `npm run start` to start Keyboard Overlay.

## Features

- You can modify all the colors, sizes and font family.
- The project supports many functions such as key count, key heatmap, kps and shortcur key displays.
- The project is cross-platform, and all you need to do is to change the key bindings.
- You can change the permutation of the keyboard to almost anyway you like.
- The keyboard will keep rendering if you don't minimize it, so you can use it in capture softwares such as OBS Studio.
- You can put your mouse to the bottom of the keyboard, and click the lock icon to lock the keyboard. In this situation, no actions will be provided unless you click the lock icon again and unlock the keyboard.
![W5W_WN_QH494_A_R`RF@_8Y.png](https://s2.loli.net/2022/05/02/oCxGhit7DIVSNPu.png)

## Settings

You can add some folders in `/asserts` and add setting files in order to modify the style of the keyboard. **Notice**: if you are using releases, the directory should be in `/resources/app/`. You can put different settings in different folders, in order to switch quickly.

You can switch the settings by `/asserts/switch.json`. For example:

```json
{
  "location": ["game", "abc"]
}
```

means using setting files in `/asserts/game/abc/` to set up the keyboard. If the file doesn't exist or the array is empty, we use setting files in `/asserts/` to initialize.

Here are all the setting files:

### options.json

This is a json file including all the function switchers and style settings. Keys and values below:

| Key | Type | Value |
| :-: | :-: | :-: | 
| **Color Scheme & Font** | **vvv** | **vvv** |
| backgroundColor | string | General background color |
| keyBackgroundColor | string | The color of keys (will be overwritten while using heatmap) |
| keyFontColor | string | The font color of keys |
| keyShadowColor | string | The color of the bottom side of a key |
| keyActiveBackgroundColor | string | The color of keys while active (will be overwritten while using heatmap) |
| keyActiveFontColor | string | The font color of keys while active |
| fontSize | number | Default font size for keys |
| fontFamily | string | Font family for all the texts |
| bounceTime | number | Milliseconds for a key to bounce up |
| **Window Settings** | **vvv** | **vvv** |
| alwaysOnTop | boolean | Select if the keyboard is always at the front of all the windows |
| antiMinimize | boolean | Automately restore while minimizing the keyboard |
| superTopLevel⚠ | boolean | Use some method to remain the keyboard at the top |
| **Functions** | **vvv** | **vvv** |
| toolBarMode | "none", "debug", "kps" or "tot" | Open debug mode, kps mode or total-only mode |
| toolBarFontSize | number | Font size for toolbar |
| keyCount | boolean | Display press count of each key |
| keyHeatmap | "none", "light", "dark" or a number | Open heatmap and set brightness |
| keyTotalCountMode | "normal" or "strict" | Open strict count mode |
| displayShortcut | boolean | Open shortcut key displayer |
| tickSpeed | number | Tick movement speed |
| tickBackgroundColor | string | Tick background color |
| **Shortcuts** | **vvv** | **vvv** |
| lockShortcut | object | Information of lock shortcut |
| cleanShortcut | object | Information of clean shortcut |
| touchShortcut | object | Enable or disable touch actions for the keyboard |

⚠: Experimental function

Some details below:

**Toolbar mode**: can be "debug mode" (display the key code you pressed), "kps mode" (calculate and display total press count and current kps) and "total mode" (only calculate and display press count).

**Heatmap brightness**: can be a number between -1.0 and 1.0. The closer the number is to -1.0, the lighter the colors will be. `light` and `dark` are equal to -0.4 and 0.5, respectively.

**Strict count mode**: a mode that only the keys on the keyboard will be calculated into press count and kps. In this mode, `TOTAL` will change to `S-TOTAL`.

**Key shortcut**: you should use following arguments to initialize the shortcut:

```
{
  "id": "L",        // The ID of the key
  "shiftKey": true, // If Shift is needed to press
  "ctrlKey": true,  // If Ctrl is needed to press
  "altKey": false,  // If Alt is needed to press
  "metaKey": false  // If Meta is needed to press
}
```

The example above means `Ctrl + Shift + L`. If you use shortcut to lock / unlock the keyboard, you will receive a system message.

**Clean shortcut**: the setting types are the same as key shortcut. after cleaning the keyboard, all the key count (so as the key heatmap and total count) will be set as zero.

**Tick**: will be mentioned in `map.txt` section.

**Super top level**: In Linux and MacOS, we use functions in Electron to reach the goal. But in Windows system, win32 api muse be used. Here I tried to use a executive file.

```cpp
#include <windows.h>
#include <cstdio>
using namespace std;

unsigned int hw[1];

int main(int argc, char* argv[]) {
  if(argc == 1){
    printf("No argument found");
    return 2;
  }
  hw[0] = atoll(argv[1]);
  HWND hwnd = *(HWND*)hw;
  ::SetForegroundWindow(hwnd);
  int ret = ::SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW);
  if(!ret){
    printf("Cannot find window");
    return 1;
  }
  while(1){
    int ret = ::SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW);
    if(!ret)
      break;
    Sleep(100);
  }
  return 0;
}
```

This code is from `/windowTop/windows.cpp`, and `win_x64.exe` is straightly built with it. You can use MinGW to build it yourself. The code tries 10 times in a second to lift the keyboard up.

If you are in a fullscreen software and click the keyboard, the software will be closed automately. You can use **Touch shortcut** to disable click actions.

If you use default settings, you can get a light keyboard with no functions. Here is a color scheme for a dark keyboard:

```json
{
  "backgroundColor": "#222",
  "keyBackgroundColor": "#444",
  "keyFontColor": "white",
  "keyShadowColor": "#555",
  "keyActiveBackgroundColor": "grey",
  "keyActiveFontColor": "white",
}
```

---

### icons.json

This is a json file, including icon definition for some of the keys (`{ keyId -> icon }`). You can find all supported icons in [FontAwesome v6.0](https://fontawesome.com/search?m=free).

Example code: 

```json
{
  "Windows": "<i class='fa-brands fa-windows'></i>",
  "Backspace": "<i class='fas fa-delete-left'></i>",
  "Menu": "<i class='fas fa-bars'></i>",
  "Up": "<i class='fas fa-arrow-up'></i>",
  "Left": "<i class='fas fa-arrow-left'></i>",
  "Right": "<i class='fas fa-arrow-right'></i>",
  "Down": "<i class='fas fa-arrow-down'></i>",
  "Home": "<i class='fas fa-turn-up'></i>",
  "End": "<i class='fas fa-turn-down'></i>",
  "PgUp": "<i class='fas fa-angle-up'></i>",
  "PgDn": "<i class='fas fa-angle-down'></i>"
}
```

---

### bindings.json / bindings_web.json

There are two json files, describing a list of keys and their codes.

Notice that the key codes in ioHook are different from them in browsers. For example, the key code of `0` is 11 in ioHook, and 48 in browsers. You can open `debug mode` to get key codes. Also, in order to identify the keys, we use the `code` in web browsers (for example, `Digit0`).

You should describe each key by these arguments: 

```
{
  "id": "0",         // The id of the key.
  "name": "0",       // The name of the key (use as the text on keyboard).
  "code": 11,        // Key code. Can be an array of key codes, meaning binding multiple key codes to this key. Each code can be a number or a string.
  "upperKey": ")",   // Upper key name of the key. Can be absent.
  "switch": "Shift", // Switch name of the key in shortcut. Can be absent.
  "mouse": true      // If the key is a mouse event key. Can be absent.
}
```

**Mouse events** are added as some key codes. They are: LeftClick, MiddleClick, RightClick, WheelForward and WheelBackward. The direction of wheel events are defined as the movement of your finger.

Notice that each keys can overwrite the bindings of previous keys.

The default key binding set is for Windows. If you are MacOS or Linux user, please make a key binding list in `debug mode`, save in `/examples` folder and set up a Pull Request.

You can preview the styles of keyboard by Live Server. In this time, we will use bindings_web.json as key binding file. We provide all the key bindings We can find on Windows, so if you are Linux or MacOS user and want to extend the list, please let us know.

---

### map.txt

This is a txt file discribing the permutation of keys. You should describe it by a light language.

Let's say that the `default_size` of keys and blanks is `2 * default_font_size`.

| Command | Meaning |
| :-: | :-: |
| `<Row>...</Row>` | Aligned items in a row |
| `<Column>...</Column>` | Aligned items in a column |
| `<Blank> width height` | A blank block with the size of `(default_size * width)px x (default_size * height)px`. The arguments can be absent, with default values of 1 |
| `<Button> keyId width height fontSize` | A button defined by key id, with the size of `(default_size * width)px x (default_size * height)px` and the font size of `fontSize * default_font_size`. Arguments `width, height, fontSize` can be absent, with default values of 1 |
| `<Icon> keyId width height fontSize` | Same as `<Button>`, but use the icon as the key text. |
| `<Kps> width height fontSize` | A KPS display block, with the size of `(default_size * width)px x (default_size * height)px` and the font size of `fontSize * default_font_size`. The arguments can be absent, with default values of 1 |
| `<Total> width height fontSize` | A TOTAL display block, with the size of `(default_size * width)px x (default_size * height)px` and the font size of `fontSize * default_font_size`. The arguments can be absent, with default values of 1 |
| `<Tick> keyId dir width height fontSize` | A tick for key with keyId as key, with the direction of dir (one of "right", "left", "top" and "bottom"), and some other settings that are the same as above. You can learn what 'tick' is from the example photo. The default value of "dir" is "right" |
| `<TickText> keyId dir width height fontSize` | Same as above, but with key name |
| `<TickIcon> keyId dir width height fontSize` | Same as above, but with key icon |

For example, you can quickly generate a 9-key keyboard with kps and total key by this code:

```
<Column>
  <Row>
    <Button> A 1 1.5
    <Button> S 1 1.5
    <Button> D 1 1.5
    <Button> F 1 1.5
    <Button> J 1 1.5
    <Button> K 1 1.5
    <Button> L 1 1.5
    <Button> ; 1 1.5
  </Row>
  <Row>
    <Kps> 1.5
    <Button> Space 5
    <Total> 1.5
  </Row>
</Column>
```

![B___E__@W_OQ8J1_S2XY066.png](https://s2.loli.net/2022/05/05/YPQuJhXT3UwSyrb.png)

and a Z-X game keyboard:

```
<Column>
  <Row>
    <TickText> Z right 5
    <Button> Z
  </Row>
  <Row>
    <TickText> X right 5
    <Button> X
  </Row>
  <Row>
    <Kps> 2
    <Total> 4
  </Row>
</Column>
```

![TL__M9Z_RNR1__CMTUYE_J8.png](https://s2.loli.net/2022/05/05/YNzTBP78Z1ExdVQ.png)

In `/examples` folder, there are some templates of maps. You can make your own map file with the rules above. If you thought that your map file is practical, you can open an Issue and provide it.

Here are the examples from `/examples` folder:

| Name | Preview |
| :-: | :-: |
|            arrows.txt            | ![6_D_7S9SIR`M~I@RWC_GPDV.png](https://s2.loli.net/2022/05/04/XZDnL2zEOWA5P8j.png) |
|        wasd-extended.txt         | ![GXY7R_N_A2TDR_2H_JN~_I.png](https://s2.loli.net/2022/05/04/R2XNOKopt4mrjC9.png) |
|    wasd-extended-numeric.txt     | ![VMHX`2LJ4_YVTP9AD_CY2_I.png](https://s2.loli.net/2022/05/04/rAfk46gDEJ2wFsS.png) |
| wasd-extended-numeric-square.txt | ![C_X8WLRHBC__WJ~SJVR~HFR.png](https://s2.loli.net/2022/05/04/M6iOG4qmkojeBsV.png) |
|          wasd-full.txt           | ![JN_E_KG4___O7N5YPHHFO~W.png](https://s2.loli.net/2022/05/04/RdztAfsljZUx8Ir.png) |
|         wasd-minimal.txt         | ![XQOS2NWY_RSH_RL@KXCM_JW.png](https://s2.loli.net/2022/05/04/wSMumBniU7OC9bJ.png) |
|          windows-60.txt          | ![J_CX_VX~UU_LBYT_@_BB0VS.png](https://s2.loli.net/2022/05/04/AOJlzbTV4MxPk7Q.png) |
|          windows-80.txt          | ![R40NH~D90_AUMQAVKM_Z7_V.png](https://s2.loli.net/2022/05/04/6mXov5KRxyMVu93.png) |
|         yghj-minimal.txt         | ![0I_8BEI@Y9KB7A_RQA`FHH8.png](https://s2.loli.net/2022/05/04/5iVzP4w8cHKlMTY.png) |

---

## Contribution

If you find any bug or want to make a feature request, open an Issue to tell us.

If you want to submit your map file or key binding file, open an Issue or Pull Request and provide them.

QQ Group: 862155660.