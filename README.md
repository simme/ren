# Ren

Declarative, streaming HTML renderer.

## API

```javascript
var ren = new (require('ren'))(options); // More about options below
var data = {
  template: 'views/page.hbs',
  data: {
    '#navbar': {
      template: 'views/partials/navbar.hbs',
      data: {
        links: {
          foobar: '/foobar',
          bar: '/baz/foorad'
        }
      }
    },
    '#contents': {
      template: 'views/page_content.hbs',
      data: {
        title: 'this is my page',
        introduction: 'lorem ipsum dolor sit amet',
        aListOfStuff: ['a', 'b', 'c', 'd'],
        // Prefix denotes a subview
        '#anotherTemplate': {
          template: 'views/foobar.hbs',
          data: {
            foobar: 'baz'
          }
        }
      }
    }
  }
};

server.on('request', function (req, res) {
  ren.render(data).pipe(res);
});
```

## How it works

* Analyses view hierarchy and creates a render queue.
* Each "parent" template gets it's child templates as dependencies set up
* Once each child view is rendered the parent is put on the render queue
* Rendered from leaf-nodes back to root node

## Data altering

Before each view is rendered the `willRender` event is emitted with the
`RenderNode` passed as data to the event listener. You can use this event to
modify data or template in a node before it's actually rendered.

You can use this to inject additional data, transform it or whatever.

## Options

* **basePath**, the base path used for view loading. Defaults to cwd.
* **concurrent**, number of views to concurrently render. Defaults to 2.
* **prefix**, change the prefix that denotes subvies. Defaults to `#`.
* **defaultCompiler**, set to extension of your default view format. You can
then omit the extension in your template properties. Defaults to `.hbs`.
* **disableCache**, loads each view every time it is rendered. Useful during
dev. Defaults to `false`.
* **compilers**, an object where the keys are extensions and the values are
a function that compiles a template (ie. `Handlebars.compile`). **REQUIRED**.

## License

MIT

