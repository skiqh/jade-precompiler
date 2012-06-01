## Usage

Add `jade-precompiler` to your dependencies section in `kanso.json`.

```javascript
  ...
  "dependencies": {
    "jade-precompiler": null,
    ...
  }
```

> run `kanso install` to fetch the package


To tell the precompiler which jade files to transform, add a section called 
`jade` to `kanso.json` and put in the files you want to process.

```javascript
  ...
  "jade": {
    "compile": [ "pages/about.jade", ... ]
  }
```

> Running `kanso push` will compile `pages/about.jade` to
`pages/about.html` and upload it to `_attachments/pages/about.jade`.

Alternately you can compile all jade files under a directory.

```javascript
  ...
  "jade": {
    "compile": [ "pages", ... ]
  }
```

Or all jade files anywhere in the kanso project.

```javascript
  ...
  "jade": {
    "compile": true
  }
```


###Parameters
The settings defined in `kanso.json` will be made available to the templates.
And since kanso is able to overwrite these settings depending on your 
`kanso push` target in `.kansorc`, your templates can take those into account, 
too.

Given the following `.kansorc`:

```javascript
  exports.env = 
      // the default env will be used when you just do "kanso push"
      { 'default': 
        { db: 'http://127.0.0.1:80/myapp' 
        , use_cdn: false
        , name: "internal dev"
        }
      // this one will be used when you do "kanso push production"
      , 'production': 
        { db: 'http://user:p4ss@doma.in:5984/myapp'
        , use_cdn: true
        , name: "doma.in portal"
        }
      }

```

Used with a template containing these lines,

```jade
doctype 5
html(lang="en")
  head
    title= name
  body
    h1 Welcome
    #container
      p main content goes here

    if use_cdn
      script(src='//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js')
      script
        window.jQuery || document.write('<script src="javascripts/libs/jquery-1.7.2.min.js"><\\/script>')
    else
      script(src='javascripts/libs/jquery-1.7.2.min.js')
```

on `kanso push` the jade-preprocessor will yield

```html
<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>internal dev</title>
    </head>
    <body>
      <h1>Welcome</h1>
      <div id="container">
        <p>main content goes here</p>
      </div>
      <script src="javascripts/libs/jquery-1.7.2.min.js">
    </script>
  </body>
</html>
```

on `kanso push production` however, it will produce

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>doma.in portal</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <div id="container">
      <p>main content goes here</p>
    </div>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="javascripts/libs/jquery-1.7.2.min.js"><\\/script>')</script>
  </body>
</html>
```

###Compression

The jade-preprocessor can be told to compress the output through the 
`compress` flag (internally, jade refers to this as the `pretty` flag, but we 
stick to the more canonical `compress`, just like in the less- and stylus-
precompilers).

```javascript
  ...
  "jade": {
    "compile": [ ... ],
    "compress": true
  }
```

Note: consider using the `overrides` property in your `.kansorc` to set the 
compress flag according to your push target like so:

```javascript
  exports.env = 
      // the default env will be used when you just do "kanso push"
      { 'default': 
        { db: 'http://127.0.0.1:80/myapp' 
        , use_cdn: false
        , name: "internal dev"
        , overrides: 
          { jade:
            { compress: false   // never compress for this environment
            }
          }
        }
        }
      // this one will be used when you do "kanso push production"
      , 'production': 
        { db: 'http://user:p4ss@doma.in:5984/myapp'
        , use_cdn: true
        , name: "doma.in portal"
        , overrides: 
          { jade:
            { compress: true    // always compress for this environment
            }
          }
        }
      }

```

### Removing original .jade files

You can also remove any .jade files from attachments (if you placed them 
inside a directory also added as static files), by adding the 
`remove_from_attachments` property. This will remove all attachment with a 
`.jade` extension!

```javascript
  ...
  "jade": {
    "compile": [ ... ],
    "remove_from_attachments": true
  }
```
