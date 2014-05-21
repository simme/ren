module.exports = {
  template: 'page',
  data: {
    '#navbar': {
      template: 'partials/navbar',
      data: {
        links: [1, 2, 3]
      }
    },
    '#contents': {
      template: 'page_content',
      data: {
        title: 'fobar',
        introduction: 'lorem ipsum',
        aListOfStuff: ['a', 'b', 'c'],
        '#anotherTemplate': {
          template: 'foobar',
          data: {
            foobar: 'bar'
          }
        },
        '#functionTemplate': {
          function: function (data) {
            return data.foobar;
          },
          data: {
            foobar: 'bar'
          }
        }
      }
    }
  }
};

