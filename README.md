# BulldozerPIXI

## Table of Contents

- [Introduction](#introduction)
- [Credits](#credits)
- [Play](#play)
- [Download](#download)
- [Instructions](#instructions)


## Introduction

BulldozerPIXI is a half-baked recreation of the Bulldozer game series created by John 'FlyMan' Hattan (The Code Zone). This is a puzzle game (a variation of Sokoban) where the objective is to push the boulders onto the bullseye targets without getting them stuck on the tilemap. While the game concept is simple, some advanced map levels can be incredibly challenging.

~~The aim of this project was to make my childhood favourite, playable on a modern web browser and even on mobile devices.~~ It has recently come to my attention, that the updated game series by the original author is **available fully-featured for mobile platforms at [Codezone](https://www.thecodezone.com/game/bulldozer.html)**. 

## Credits

* John 'FlyMan' Hattan for his incredible work on the Bulldozer game series. Check out the fully featured mobile app at https://www.thecodezone.com/game/bulldozer.html

* Weston Campbell for the BulldozerAHK project. Tilemap graphics and map data were sourced from his repo. Check out his awesome implementation at https://github.com/westoncampbell/BulldozerAHK

* [PixiJS](https://github.com/pixijs/pixijs) - The HTML5 Creation Engine: Create beautiful digital content with the fastest, most flexible 2D WebGL renderer    


* [@pixi/tilemap](https://github.com/pixijs/tilemap) - PixiJS Tilemap Kit:  Rectangular tilemap implementation for PixiJS   
 

## Play

BulldozerPIXI is hosted publicly on github pages. You can access it at https://cyberstein.tech/bulldozer.

![Gameplay](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/gameplay-1.png)

## Download

If you want to host the static files yourself, download the release and place the files in your web server root directory and serve.

## Instructions

1. You can move the bulldozer character up(W or Up-Arrow keys), down(S or Down-Arrow keys), left(A or Left-Arrow keys) or right(D or Right-Arrow keys). If playing on a mobile device, you are limited to the onscreen arrow-key buttons.

![Arrow keys](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/keyboard.png)

2. You can NOT push multiple boulders at any time. Only one at a time.

![Figure 1](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/fig1.png)

3. You can NOT push against the wall or move through the walls.

![Figure 2](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/fig2.png)

4. You can NOT push a boulder against the wall
 
![Figure 3](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/fig3.png)

5. Be careful with pushing boulders against the wall. The boulder might become "stuck" and you might have to restart the level. There is an option available to undo the bulldozer character's last move in the menu bar.

![Figure 4](https://github.com/cyberstein-tech/bulldozerPIXI/blob/main/assets/fig4.png)


