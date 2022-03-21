## How to add custom data layer

0. Upload GeoTiff out to Blob Storage and generate Mosiacs - https://github.com/PacificCommunity/DigitalEarthPacific/blob/main/notebooks/make_mosaics.ipynb

1. Copy an item of the array from `/public/data/dep-data.json` and edit the attributes as needed. Put this item as a new item of the array. Let's say have a new item like below.

```
[
  ...
  , 
  {
    "id": "example-sentinel",
    "type": "Collection",
    "links": [],
    "title": "Example Sentinel",
    "assets": { },
    "extent": {
        "spatial": {
            "bbox": [
              ...
            ]
        },
        "temporal": {
            "interval": [
                [...
                ]
            ]
        }
    ...
  }
]
```

2. Make a directory in `/public/stac/${id}` named as id in the json and make `mosaicinfo.json` in that directory. So in this case, the directory will be named as `/public/stac/example-sentinel`. Copy one of mosaicjson from another folder (`public/stac/sentinel-2-cloudless/mosaicinfo.json` is a good choice since it is already written in a way to support DEP data) and paste it into the directory you just made. (so it will be `/public/stac/example-sentinel/mosaicinfo.json`) Edit this file as needed. (Read the section below if you need more information about each attribute in `mosaicinfo.json`). 


3. Add your dataset to collection list in `/src/config/datasets.yml` with a proper category name. ex.[Sentinel 2 Cloudless](https://github.com/developmentseed/PlanetaryComputerDataCatalog/blob/develop/src/config/datasets.yml#L34-L35)

4. Make a pr to `develop` branch with your change. 

This process should make Viewer to display your new data layer as one of DEP collection options. Once this change is merged to `develop` branch, the change will show up to Viewer automatically.

## How to edit mosaicjson

`/public/stac/sentinel-2-cloudless/mosaicinfo.json` is the [file](https://github.com/developmentseed/PlanetaryComputerDataCatalog/blob/develop/public/stac/sentinel-2-cloudless/mosaicInfo.json) that holds the information about Digital Earth Pacific's Sentinel 2 Cloudless data. If you want to add a different date for this dataset, copy one of already existing mosaic, edit the name(this name will show up in the dropdown), format(`cog` or `mosaicjson`), url (url where your cog, or mosaicjson is hosted) as needed and add as one of mosaics. Also keep in mind that custom attribute `dep` needs to be marked as `true` for this time being.