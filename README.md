# Tiled To Halley Export

Tiled plugins for exporting Tilemaps and Tilesets in a YAML formay for halley

 - tilemap_to_halley.js
 - tileset_to_halley.js
 
The plugin requires Tiled version 1.3.4 or newer.

## Tiled Extensions
Tiled can be extended with the use of JavaScript. Scripts can be used to implement custom map formats, custom actions and new tools. Scripts can also automate actions based on signals.

More information:
* [Tiled Scripting Docs](https://github.com/mapeditor/tiled-extensions)

## Installation

When you want to add these plugins to your Tiled installation:

* Open Tiled and go to _Edit > Preferences > Plugins_ and click the "Open"
  button to open the extensions directory.

* [Download](https://github.com/chidddy/halley-tiled-export/archive/master.zip)
  the files in this repository and extract them to that location. The scripts
  can be placed either directly in the extensions directory or in a
  subdirectory.

  (Alternatively, clone this git repository into the extensions directory)
  
  Tiled extension directory is:
  
  - **Windows**
   `C:/Users/<USER>/AppData/Local/Tiled/extensions/`
  - **macOS**
  `~/Library/Preferences/Tiled/extensions/`
  - **Linux**	
  `~/.config/tiled/extensions/`

* If using a version older than Tiled 1.3.3, restart Tiled, but better update your Tiled installation

  (This was necessary because Tiled only watched existing scripts for
  changes. No restarts are necessary when making changes to existing script
  files, since it will trigger an automatic reloading of the scripts.)