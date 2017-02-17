'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW: This loads all our blog articles sorted in order of their publication date and pushes them to the article element on index.html. Each article object is a row. They come from our data JSON file and go to index.html.

Article.loadAll = function(rows) {//Rows are records. In this case, blog articles. Article.loadAll loads the array of articles//
  // DONE: describe what the following code is doing
  rows.sort(function(a,b) {//A callback is being passed into the function, which is called when rows.sort is executed. We're sorting the records by date.//
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: describe what the following code is doing
  rows.forEach(function(ele) {//ele refers to elements in an array. Here, it's a placeholder. This is cycling through the articles in our article array and pushing each one to the article element in index html.//
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW
    Check for records in the database. If there are no records in the database, get them from the JSON file and add them to the database.
 */
Article.fetchAll = function(callback) {//if there are records in the database, do one thing. Else...//
  // DONE: describe what the following code is doing
  $.get('/articles') //Look for records in the database
  // DONE: describe what the following code is doing
  .then(
    function(results) {
      if (results.length) { // If records exist in the database
        // DONE: describe what the following code is doing
        Article.loadAll(results); //load the database records
        callback();
      } else { // if NO records exist in the database
        // DONE: describe what the following code is doing
        $.getJSON('./data/hackerIpsum.json') //grab our JSON file
        .then(function(rawData) {
          rawData.forEach(function(item) {//cycle through all the records in the JSON
            let article = new Article(item);
            article.insertRecord(); // and add each record to the DB
          })
        })
        // TODO: describe what the following code is doing
        .then(function() {
          Article.fetchAll(callback);
        })
        // TODO: describe what the following code is doing
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW
    Deletes the data in the table, leaving the schema in place.
 */
Article.truncateTable = function(callback) {//deletes all data in table if callback(callback)//
  // DONE: describe what the following code is doing
  $.ajax({//goes to our controller, which is server js, via ajax. When the request is made by that method, it gets to server js and//
    url: '/articles', //ajax request to url of articles
    method: 'DELETE', //with the method of delete--a REST http delete method, which is being handled by the server.
  })
  // DONE: describe what the following code is doing
  .then(function(data) {
    console.log(data); //logs data to the console.
    if (callback) callback(); //I'm still fuzzy on this//
  });//
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW
  This is the method by which we insert new (local) articles into the database.
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: describe what the following code is doing
  //inserting new articles into the database
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: describe what the following code is doing
  .then(function(data) {
    console.log(data); //console logging data, again.
    if (callback) callback(); //still fuzzy here.
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW
  This is the method by which we delete records from the database
 */
Article.prototype.deleteRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.ajax({ //ajax talks to our controller to get it to delete
    url: `/articles/${this.article_id}`,//here's where the articles are
    method: 'DELETE' //here's what we're doing to them.
  })
  // DONE: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback(); //callbacks are still fuzzy
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - This is the method by which we update records in our database.
 */
Article.prototype.updateRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.ajax({ //ajax communicates with the controller
    url: `/articles/${this.article_id}`,//at this Url
    method: 'PUT',//
    data: {  // TODO: describe what this object is doing
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();//fuzzy
  });
};
