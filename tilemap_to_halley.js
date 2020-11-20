
class HalleyTilemapFormat {
    constructor(map, filename)
    {
        for(var key in map.properties())
        {
            this[key] = map.properties()[key];
        }
        this.width = map.width;
        this.height = map.height;
        this.tileWidth = map.tileWidth;
        this.tileHeight = map.tileHeight;
        this.layerCount = map.layerCount;

        this.tilesets = [];
        var tilesets = map.usedTilesets();
        for(var i = 0; i < tilesets.length; i++)
        {
            this.tilesets[i] = tilesets[i].name;
        }


        this.layers = this.parse_layers(map);
    }

    write(fileName)
    {
        const file = new TextFile(fileName, TextFile.WriteOnly);
        file.write(this.template());
        file.commit();
    }

    formatObject(obj, num)
    {
        var ret_str = ``;
        var first = true;
        var first_str = "";
        for(var k in obj)
        {
            if(obj.hasOwnProperty(k))
            {
                if((k == "id" || k == "name") && first)
                {
                    if(num > 0) ret_str += `${"  ".repeat(num)}- `;
                    ret_str += `${k}: ${obj[k]}\n`
                    first = false;
                    first_str = k;
                }
                if((k == "id" || k == "name") && !first && k == first_str)
                {
                    continue;
                }
                if(typeof obj[k] == "string")
                {
                    if(num > 0) ret_str += `${"  ".repeat(num)}  `;
                    ret_str += `${k}: ${obj[k]}\n`;
                }
                if(typeof obj[k] == "number")
                {
                    if(num > 0) ret_str += `${"  ".repeat(num)}  `;
                    ret_str += `${k}: ${obj[k]}\n`;
                }
                if(typeof obj[k] == "boolean")
                {
                    if(num > 0) ret_str += `${"  ".repeat(num)}  `;
                    ret_str += `${k}: ${obj[k]}\n`;
                }
                if(typeof obj[k] == "object")
                {
                   if(Array.isArray(obj[k]))
                   {
                        if(num > 0) ret_str += `${"  ".repeat(num)}  `;
                        ret_str+= `${k}:\n`;
                        for(let i = 0; i < obj[k].length; i++)
                        {
                            if(typeof obj[k][i] == "string")
                            {
                                if(num+1 > 0) ret_str += `${"  ".repeat(num+1)}- `;
                                ret_str+= `${obj[k][i]}\n`;
                            } else {
                            ret_str += this.formatObject(obj[k][i], num+1);
                            }
                        }
                   }
                }
            }
        }
        return ret_str;
    }

    template()
    {
        var ret_str = `---\n`;
        ret_str += this.formatObject(this, 0);
        ret_str += `...`
        return ret_str;
    }

    parse_layers(obj)
    {
        var ret = [];
        for(var i = 0; i < obj.layerCount; i++)
        {
            var tmp = {};
            var layer = obj.layerAt(i);
            if(layer.isTileLayer)
            {
                tmp = this.parse_tile_layer(layer);
            }
            if(layer.isObjectLayer)
            {
                tmp = this.parse_object_layer(layer);
            }
            if(layer.isGroupLayer)
            {
                tmp = this.parse_group_layer(layer);

            }

            for(var key in layer.properties())
            {
                tmp[key] = layer.properties()[key];
            }

            switch(tmp.type)
            {
                case "group":
                case "nav":
                case "coll":
                    tmp.visible = false;
                    break;
                case "object":
                case "tile":
                    tmp.visible = true;
                    break;
            }

            ret[i] = tmp;
        }

        return ret;
    }

    parse_tile_layer(layer)
    {
        var ret = {};
        ret.name = layer.name;
        ret.width = layer.width;
        ret.height = layer.height;
        ret.tiles = [];
        for(var y = 0; y < layer.height; ++y)
        {
            for(var x = 0; x < layer.width; ++x)
            {
                var cell = layer.cellAt(x,y);
                if(cell.tileId == -1)
                {
                    continue;
                }
                var tmp = {};
                var tile = layer.tileAt(x,y);

                tmp.id = tile.id;
                tmp.x = x;
                tmp.y = y;
                tmp.tileset = tile.tileset.name;
                tmp.flippedHorizontally = cell.flippedHorizontally;
                tmp.flippedVertically = cell.flippedVertically;
                tmp.flippedAntiDiagonally  = cell.flippedAntiDiagonally;
                
                ret.tiles.push(tmp);

            }
        }


        return ret;
    }

    parse_object_layer(layer)
    {
        var ret = {};
        ret.name = layer.name;
        ret.type = "object";
        ret.object_count = layer.objectCount;
        ret.objects = [];
        for(var i = 0; i < layer.objects.length; i++)
        {
            var object = layer.objects[i];
            var tmp = {};

            tmp.id = object.id;
            tmp.name = object.name;
            tmp.type = object.type;
            tmp.x = object.x;
            tmp.y = object.y;
            tmp.width = object.width;
            tmp.height = object.height;
            tmp.rotation = object.rotation;

            switch(object.type)
            {
                case "tile":
                    tmp.tileid = object.tile.id;
                    tmp.tileset = object.tile.tileset.name;
                    tmp.tileFlippedHorizontally = object.tileFlippedHorizontally;
                    tmp.tileFlippedVertically = object.tileFlippedVertically;
                    tmp.visible = true;
                    break;
                case "area":
                    tmp.visible = false;
                    break;
            }

            ret.objects.push(tmp);
        }

        return ret;
    }

    parse_group_layer(layer)
    {
        var ret = {};

        ret.name = layer.name;
        ret.type = "group";
        ret.layerCount = layer.layerCount;
        ret.layers = this.parse_layers(layer);

        return ret;
    }
};

const customTileMapFormat = {
    name: "Halley Tilemap format",
    extension: "yaml",

    write: function (map, fileName) {
        const exporter = new HalleyTilemapFormat(map, fileName);
        exporter.write(fileName);
    }
};

tiled.registerMapFormat("halley", customTileMapFormat);

/*
---
name:
width:
height:
tilesets(image names): (use usedTilesets())
layercount(levels because of how grouping works):
layers:
    - (layer name)
    type: (the standard tile, object, group(height for us) + collision, navigation as dif types)
    visible: (true for only tile and object layers )

    IF GROUP LAYER
    layer_count:
    layers:
        - list of layers (get from layerAt(index in layercount))
    ENDIF

    IF TILE LAYER
    width:
    height:
    tiles:
        - list of tiles
    ENDIF

    IF OBJECT LAYER
    object_count:
    objects:
        - list of objects
    ENDIF

    TILES
    tileId:
    flippedHorizontally:
    flippedVertically: 
    END

    OBJECTS
    objectId:
    name:
    type:
    x:
    y:
    width:
    height:
    visible: (only true for certain types)
    //FROM tile:
    tileid:
    tileFlippedHorizontally:
    tileFlippedVertially:
    rotation: (degress clockwise)
    END


...


*/