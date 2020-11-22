
class HalleyTilesetFormat {
    constructor(tileset, fileName){
        this.name = tileset.name;
        this.collection = (tileset.image.length < 1) ? true : false;
        if(!this.collection){
            this.image = tileset.image.split('\\').pop().split('/').pop();
            this.tilewidth = tileset.tileWidth;
            this.tileheight = tileset.tileHeight;
            this.imagewidth = tileset.imageWidth;
            this.imageheight = tileset.imageHeight;
        }
        this.tilecount = tileset.tileCount;
        this.objectAlignment = tileset.objectAlignment;
        this.tiles = [];
        for(var key in tileset.properties())
        {
            this[key] = tileset.properties()[key];
        }
        if(!this.collection){
        var columns = Math.floor((tileset.imageWidth + tileset.tileSpacing - tileset.margin)/(tileset.tileWidth + tileset.tileSpacing));
        }
        var tiles = tileset.tiles;
        for(let i = 0; i < tiles.length; i++)
        {
            var tile = tiles[i];
            var tmp = {};
            tmp.id = tile.id;
            tmp.tileset = tileset.name;
            tmp.width = tile.width;
            tmp.height = tile.height;
            if(!this.collection){
                tmp.x = tile.id % columns;
                tmp.y = Math.floor(tile.id/columns);    
                tmp.image = `:img:${this.image}_${tmp.x}_${tmp.y}`;       
            } else {
                tmp.image = tile.imageFileName.split('\\').pop().split('/').pop();
            }

            tmp.animated = tile.animated;
            if(tile.animated)
            {
                tmp.frames = [];
                for(let j = 0; j < tile.frames.length; j++)
                {
                    var tmpfrm = {};
                    //console.info(`${tile.frames[j].tileId}`);
                    tmpfrm.id = tile.frames[j].tileId;
                    tmpfrm.frame = j;
                    tmpfrm.duration = tile.frames[j].duration;
                    tmpfrm.img = `:img:${this.image}_${tmpfrm.id%columns}_${Math.floor(tmpfrm.id/columns)}`
                    tmp.frames.push(tmpfrm);
                }
            }

            this.tiles[tmp.id] = tmp;
        }
    };

    write(fileName){
        const file = new TextFile(fileName, TextFile.WriteOnly);
        file.write(this.template());
        file.commit();
    };

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

    template(){
        var ret_str = `---\n`;
        ret_str += this.formatObject(this, 0);
        ret_str += `...`
        return ret_str;
    }

};


const customTileSetFormat = {
    name: "Halley Tileset format",
    extension: "yaml",

    write: function (tileset, fileName) {
        const exporter = new HalleyTilesetFormat(tileset, fileName);
        exporter.write(fileName);
    }
};

tiled.registerTilesetFormat("halley", customTileSetFormat);