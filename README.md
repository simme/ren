# Reinderer

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

## License

MIT

