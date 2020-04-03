# npm-dependency-links

[![](https://vsmarketplacebadge.apphb.com/version/herrmannplatz.npm-dependency-links.svg)](https://marketplace.visualstudio.com/items?itemName=herrmannplatz.npm-dependency-links) [![](https://vsmarketplacebadge.apphb.com/installs/herrmannplatz.npm-dependency-links.svg)](https://marketplace.visualstudio.com/items?itemName=herrmannplatz.npm-dependency-links) [![](https://vsmarketplacebadge.apphb.com/rating/herrmannplatz.npm-dependency-links.svg)](https://marketplace.visualstudio.com/items?itemName=herrmannplatz.npm-dependency-links)

Links the depedencies in your package.json to their npmjs.com profile.

## Features

Visit the npmjs.com profile of your dependencies by simply `CMD/Ctrl+click` on the package name in your package.json.

![link example](images/promo.gif)

## Custom Registry URL
You can also pass custom registry url. For example, if you are using verdaccio. Default value is `https://www.npmjs.com/package/`.

To change the url, you need to set this configuration value in `settings.json`

`"npmDependencyLinks.registryUrl": "http://myCustomRegistry/"`

_Note: Don't forget to put `"/"` in the end._

## Requirements

Visual Studio Code > 1.17.0
