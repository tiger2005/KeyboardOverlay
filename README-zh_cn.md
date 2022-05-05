# KeyboardOverlay

高自定义度的键盘显示器，支持显示快捷键、独立按键次数统计、KPS 等。

[English Description](https://github.com/tiger2005/KeyboardOverlay/blob/main/README.md)

![RP53DLI5_NW`W21O4VM_PT6.png](https://s2.loli.net/2022/05/02/mldJFwyZ9aDzGCn.png)

这是一份示例。其中使用了 `windows-80.txt` 内部的键盘布局，开启了 KPS 模式和快捷键显示。使用 "Config" 作为字体。

这是一个基于 Electron 开发的软件。其依赖于 ioHook 以捕获全局键盘和鼠标事件，和 FontAwesome v6 以提供图标库。

感谢 @YuzhenQin 帮忙添加了 Github Actions。 现在你可以直接从 Github 上下载发行版本。

## 预览

你可以在 https://tiger2005.github.io/KeyboardOverlay/ 预览项目。

如果你下载了源代码，你可以 **在不安装软件的情况下** 预览键盘。我们加入了网页浏览器的支持，你可以使用 Live Server 或者上传到服务器中。

如果你下载了发行版本，那么源代码位于 `/resources/app/`。你可以像上面提到的那样预览键盘。

## 使用

你可以直接下载发行版本压缩包，并且在本地解压后运行内部的可执行文件。以下为通过源代码运行的方法：

1. 将这个项目的源代码下载到本地。

2. 在项目根目录下，运行 `npm install` 下载依赖包。

3. 前往 `/node_modules/iohook`，并运行以下命令（于 `/package.json` 中的 `rebuildnew` 命令一致）： 

```
npm rebuild --runtime=electron --target=12.0.0 --disturl=https://atom.io/download/atom-shell --abi=87
```

这个命令将会添加一个文件夹 `/node_modules/iohook/builds`，内部储存了 ioHook 的预编译内容。

4. 返回项目根目录，并运行 `npm run start` 以启动 Keyboard Overlay。

## 特性

- 你可以更改所有的颜色、大小和字体。
- 这个项目支持很多的功能，包括独立按键数量、热力图、KPS 显示和快捷键显示等。
- 这个项目是全平台通用的，你只需要更换键位配置。
- 你可以任意更换键位布局。
- 键盘在非最小化的情况将会一直渲染，因此你可以用在类似于 OBS Studio 的录制软件上。
- 你可以将鼠标放在键盘下方，并点击浮起的锁定按钮锁定键盘。键盘在此起降将会保持锁定，直到你再次点击锁定按钮解除锁定。
  ![W5W_WN_QH494_A_R`RF@_8Y.png](https://s2.loli.net/2022/05/02/oCxGhit7DIVSNPu.png)

## 设置

你可以在 `/asserts` 里面创建文件夹，并通过里面的文件更改键盘属性。 **注意**: 如果你是用的是发行版本，这个文件夹在 `/resources/app/` 中。你可以对于每一个用途单独建立一个文件夹存储设置信息，方便进行设置切换。

切换通过 `/asserts/switch.json` 实现。其构成如下：

```json
{
  "location": ["game", "abc"]
}
```

其表示导入 `/asserts/game/abc/` 内的设置文件进行键盘设置。如果这个文件不存在或者数组为空，将会使用 `/asserts/` 内的设置文件直接进行设置。

以下为所有需要的设置文件：

### options.json

这是一个 JSON 文件，包含了所有的功能开关和样式设置。以下为键值和内容：

|           键值           |                类型                 |                内容                |
| :----------------------: | :---------------------------------: | :--------------------------------: |
|     backgroundColor      |               string                |              背景颜色              |
|    keyBackgroundColor    |               string                |     按键颜色（会被热力图覆盖）     |
|       keyFontColor       |               string                |            按键字体颜色            |
|      keyShadowColor      |               string                |            按键侧面颜色            |
| keyActiveBackgroundColor |               string                | 按键按下后的颜色（会被热力图覆盖） |
|    keyActiveFontColor    |               string                |       T按键按下后的字体颜色        |
|         fontSize         |               number                |            默认字体大小            |
|        fontFamily        |               string                |           所有文字的字体           |
|       alwaysOnTop        |               boolean               |          选择是否置顶键盘          |
|       toolBarMode        |   "none", "debug", "kps" or "tot"   |     打开调试、KPS 和仅统计模式     |
|     toolBarFontSize      |               number                |           工具栏字体大小           |
|         keyCount         |               boolean               |       显示每个按键的点击次数       |
|        keyHeatmap        | "none", "light", "dark" or a number |      打开热力图并且设置明亮度      |
|    keyTotalCountMode     |        "normal" or "strict"         |          打开严格统计模式          |
|     displayShortcut      |               boolean               |           打开快捷键显示           |
|       antiMinimize       |               boolean               |       在尝试最小化时自动复原       |
|        bounceTime        |               number                |        一个按键弹起的毫秒数        |
|       lockShortcut       |               object                |          锁定的快捷键信息        |
|      cleanShortcut       |               object                |          清空的快捷键信息        |
|        tickSpeed         |               number                |            点击波动速度          |
|    tickBackgroundColor   |               string                |          点击波动背景颜色        |

一些细节如下：

**工具栏模式**：可以是“调试模式”（显示当前按键的键值）、“KPS 模式”（显示目前按下的按键次数和 KPS）和“仅统计模式”（只统计按键次数）。

**热力图明亮度**：可以是一个在 -1.0 和 1.0 之间的数字。数字越接近 -1.0，热力图就越量亮。`light` 和 `dark` 分别等于 -0.4 和 0.5。

**严格统计模式**：在模式下，只有在显示的按键范围中的字符会计入按键次数和 KPS。在这个模式下，`TOTAL` 将会换为 `S-TOTAL`。

**锁定快捷键**：你需要使用以下参数配置快捷键：

```
{
  "id": "L",        // 需要按下的按键对应的 ID
  "shiftKey": true, // 是否按下 Shift
  "ctrlKey": true,  // 是否按下 Ctrl
  "altKey": false,  // 是否按下 Alt
  "metaKey": false  // 是否按下 Meta
}
```

上述例子表示的快捷键即为 `Ctrl + Shift + L`。在使用快捷键锁定或者解锁键盘的时候将会收到系统通知。

**清空快捷键**：设置方法和锁定快捷键一样。在清空键盘后，所有的按键点击次数（包括热力图和总数）将会清零。

如果你使用默认设置，你将会得到一个亮色、无功能键盘。以下是暗色的配色方案：

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

**波动**：将会在之后的 `map.txt` 中讲到。

---

### icons.json

这是一个 JSON 文件，包含了一些键对应的图标（`{键ID -> 图标}`）。你可以在 [FontAwesome v6.0](https://fontawesome.com/search?m=free) 找到所有支持的图标。

代码示例：

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

这是两个 JSON 文件，包含一些键及其对应的键码。

需要注意的是 ioHook 提供的键码和浏览器并不相同。比如说，`0` 的键码在 ioHook 中是 11，而在浏览器中是 48。你可以打开“调试模式”获取键码。同时，为了更好的区分每个键，我们在浏览器中使用 `code` 值（比如 `Digit0`）。

你需要使用以下信息描述一个按键：

```
{
  "id": "0",         // 键的 ID。
  "name": "0",       // 键的名字（用于在键盘上显示）。
  "code": 11,        // 键码，可以是一个数字。每一个键码应该是一个数字或者一个字符串。
  "upperKey": ")",   // 按下 Shift 后需要显示的字符。可选项。
  "switch": "Shift", // 在快捷键组合中是否为功能键，且给出其名字。可选项。
  "mouse": true      // 这个键是否为鼠标类型的按键。可选项。
}
```

**鼠标事件** 以键码形式加入。它们是： LeftClick、MiddleClick、RightClick、WheelForward 和 WheelBackward。滚轮方向使用手指移动方向定义。

需要注意的是每个键可以覆盖之前定义的键码对应关系。

默认的按键事件适用于 Windows。如果你是 Linux 或者 MacOS 用户，请使用“调试模式”制造出一份按键对应表，保存在 `/examples` 文件夹中并开一个 Pull Request。

你可以使用 Live Server 预览这个键盘的样式。在这个时候，我们使用 bindings_web.json 作为按键对应文件。我们提供了在 Windows 能找到的所有按键，所以如果你是其他系统的使用者并且想扩大这张表，请告诉我们。

---

### map.txt

这是一个描述键位布局的文件。你需要使用一个轻量语言米描述它们。
我们定义每个按键和空白的 `default_size` 为 `2 * default_font_size`.

|                  命令                  |                             含义                             |
| :------------------------------------: | :----------------------------------------------------------: |
|            `<Row>...</Row>`            |                      将元素排列在一行内                      |
|         `<Column>...</Column>`         |                      将元素排列在一列内                      |
|        `<Blank> width height`          | 一个空元素，大小为 `(default_size * width)px x (default_size * height)px`。参数可以省略，此时默认为 1 |
| `<Button> keyId width height fontSize` | 一个键 ID 为 keyId 的按钮，大小为`(default_size * width)px x (default_size * height)px`，字体大小为 `fontSize * default_font_size`。参数 `width, height, fontSize` 可以省略，此时默认为 1 |
|  `<Icon> keyId width height fontSize`  |         和 `<Button>` 一样，但是使用图标作为按键文字         |
|    `<Kps> width height fontSize`       | 一个 KPS 显示块，大小为 `(default_size * width)px x (default_size * height)px`，字体大小为 `fontSize * default_font_size`。参数可以省略，此时默认为 1 |
|   `<Total> width height fontSize`      | 一个点击总数显示块，大小为 `(default_size * width)px x (default_size * height)px`，字体大小为 `fontSize * default_font_size`。参数可以省略，此时默认为 1 |
| `<Tick> keyId dir height width fontSize` | 一个点击波纹模块，绑定到键 ID 为 keyId 的键上，方向为 dir（"right"、"left"、"top"、"bottom" 中的一个），其余同上。此时将会生成一个无文字的点击波纹，在点击的时候将会出现一个矩形并且跟着方向移动，松开后矩形会固定大小并且移动直到超出边框。dir 默认为 "right"，其余同上 |
| `<TickText> keyId dir height width fontSize` | 同上，但是会显示键名称 |
| `<TickIcon> keyId dir height width fontSize` | 同上，但是会显示键图标 |

比如说，你可以使用以下代码快速生成一个 9K 带键盘信息显示的键盘：

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

也可以使用如下代码生成一个 Z-X 按键的游戏键盘：

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

在 `/examples` 文件夹中，会有若干个键位布局模板。你可以根据上述规则创建你自己的键位布局。如果你觉得你的键位布局很实用，可以尝试开一个 Issue 并提供它。

以下是 `/examples` 文件夹下的模板：

|               名字               |                             预览                             |
| :------------------------------: | :----------------------------------------------------------: |
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

如果你找到了任何的 bug 或者想要提出功能需求，请开 Issue 告诉我们。

如果你想要提供你的键位布局或者按键映射，请开 Issue 或者 Pull Request，并提供它们。