Raco Tècnic website
===================

This is all the code of Racó Tècnic's website.

If you wanna improve something, or wanna colab with us, just fork the project
and create a new post with `rake new_post`.

Running locally
---------------

Obviously the first step is to clone the project:

~~~bash
git clone git@github.com:elboletaire/racotecnic.git
~~~

> Note: If you wanna collab with us, first step is to fork the project and then clone
from your fork.

### Prerequisites



### Running

After you have properly installed RVM on your machine you can safely run:

~~~bash
rvm use 2.3
gem install bundler
bundle install
~~~

Ensure that `_config.yaml` has proper host configuration (under `url`) and,
after that:

~~~bash
# theorically `serve` also builds, but just in case...
jekyll build
# run the local server (and watch for changes)
jekyll serve
~~~
