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


To tell the precompiler which jade files to transform, add a section called `jade`
to `kanso.json` and put in the files you want to process.

```javascript
  ...
  "jade": {
    "compile": [ "pages/about.jade", ... ]
  }
```

> Running `kanso push` will compile `pages/about.jade` to 
`pages/about.html` and upload it to `_attachments/pages/about.jade`.


###Parameter objects

It is possible to pass an object to each of the jade files. Define it under the key `constants`

```javascript
  ...
  "jade": {
    "compile": [ ... ],
    "constants": {
      "tag": "development",
      "author": {
        "name": "skiqh",
        "site": "https://github.com/skiqh/jade-precompiler"
      }
    }
  }
```

Used with a template containing these lines,

```jade
#title
  h1 The infamous jade preprocessor for kanso
  span.tag= environment

#contact
  a(href='#{author.site}')= author.name
```

the jade-preprocessor will yield 

```html
<div id="title">
  <h1>The infamous jade preprocessor for kanso</h1>
  <span class="tag">development</span>
</div>

<div id="contact">
   <a href="https://github.com/skiqh">skiqh</a>
</div>
```



###Compression

The jade-preprocessor can be told to compress the output through the `compress` flag (internally,
jade refers to this as the `pretty` flag, but we stick to the more canonical `compress`, just like in the
less- and stylus-precompilers).

```javascript
  ...
  "jade": {
    "compile": [ ... ],
    "compress": true
  }
```

### Removing original .jade files

You can also remove any .jade files from attachments (if you placed them inside a
directory also added as static files), by adding the `remove_from_attachments`
property. This will remove all attachment with a `.jade` extension!

```javascript
  ...
  "jade": {
    "compile": [ ... ],
    "remove_from_attachments": true
  }
```