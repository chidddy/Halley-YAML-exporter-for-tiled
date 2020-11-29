
class HalleyTilemapFormat {
    constructor(map, filename)
    {
        this.map = map;
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


        this.tiles = [];
        this.objects = [];
        this.parse_layers(map);
    }

    write(fileName)
    {
        const file = new TextFile(fileName, TextFile.WriteOnly);
        delete this.map;
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

    parse_layers(obj, main_layer = undefined)
    {
        var tiebreaker = 0;
        for(var i = 0; i < obj.layerCount; i++)
        {
            var layer = obj.layerAt(i);
            if(layer.properties()["type"] == "coll") continue;
            var lay_num = main_layer == undefined ? i : main_layer;
            if(layer.isTileLayer)
            {

                var coll_layer = undefined;

                for(var j = 0; j < obj.layerCount; j++)
                {
                    if(obj.layerAt(j).properties()["type"] == "coll")
                    {
                        coll_layer = obj.layerAt(j);
                    }
                }
                this.parse_tile_layer(layer, lay_num, tiebreaker, i == 0 ? coll_layer : undefined);
                tiebreaker += 0.1;
            }
            if(layer.isObjectLayer)
            {
                this.parse_object_layer(layer, lay_num);
            }
            if(layer.isGroupLayer)
            {
                this.parse_group_layer(layer, lay_num);

            }
        }
    }

    parse_tile_layer(layer, layer_num, tiebreaker, coll_data)
    {
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
                tmp.tiebreaker = tiebreaker;
                tmp.layer = layer_num;
                tmp.animated = tile.animated;
                if(coll_data != undefined){
                    var coll_cell = coll_data.cellAt(x,y);
                    if(coll_cell.tileId != -1){
                        var coll_tile = coll_data.tileAt(x,y);
                        tmp.coll_tileset = coll_tile.tileset.name;
                        tmp.coll_id = coll_tile.id;
                    }
                }
                if(tmp.coll_id != undefined && tmp.coll_id != null)
                {
                    tmp.coll = true;
                } else 
                {
                    tmp.coll = false;
                }


                this.tiles.push(tmp);
            }
        }
    }

    parse_object_layer(layer, layer_num)
    {
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
            tmp.layer = layer_num;

            switch(object.type)
            {
                case "tile":
                    tmp.tileid = object.tile.id;
                    tmp.tileset = object.tile.tileset.name;
                    tmp.tileFlippedHorizontally = object.tileFlippedHorizontally;
                    tmp.tileFlippedVertically = object.tileFlippedVertically;
                    tmp.tiebreaker = tmp.y;
                    tmp.visible = true;
                    break;
                case "area":
                case "entrance":
                    tmp.visible = false;
                    break;
            }

            for(var key in object.properties())
            {
                tmp[key] = object.properties()[key];
            }

            this.objects.push(tmp);
        }
    }

    parse_group_layer(layer, i)
    {
        this.parse_layers(layer, i);
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