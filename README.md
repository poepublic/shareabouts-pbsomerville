Shareabouts for PB Somerville
=============================
This is a fork of the [Shareabouts](https://www.github.com/openplans/shareabouts) project, which is a tool for collecting public input on planning and design issues. This fork is intended to be used by the [Participatory Budgeting](http://www.somervillema.gov/pb) process in Somerville, MA.

Customizations:
- Mailchimp integration
  - Set the `MAILCHIMP_API_KEY` and `MAILCHIMP_LIST_ID` environment variables to enable Mailchimp integration.
  - The Mailchimp integration is implemented through a checkbox on the place form. If the checkbox is checked, upon successful submission the user's email address will be added to the Mailchimp list.

Exporting ideas:

```bash
cd scripts
USERNAME=... PASSWORD='...' python exportideas.py > exports/ideas-$(date -Idate).csv
```

----------

Shareabouts [![Build Status](https://secure.travis-ci.org/openplans/shareabouts.png)](http://travis-ci.org/openplans/shareabouts)
===========

[![Join the chat at https://gitter.im/openplans/shareabouts](https://badges.gitter.im/openplans/shareabouts.svg)](https://gitter.im/openplans/shareabouts?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Shareabouts is an online mapping tool to gather crowdsourced public input in a social and engaging process. Using Shareabouts, people can drop a pin on a map to provide ideas, suggestions, and comments for planning and design issues. And as a mobile-friendly application, Shareabouts makes it easy to add input on the go.

A short guide to setting up Shareabouts
-----------

It's helpful, but not required, to know about the [architecture of Shareabouts](https://github.com/openplans/shareabouts/blob/master/doc/ARCHITECTURE.md) before starting.

<a name="heroku-button"></a>The easiest way to set up Shareabouts is to use the Heroku Button.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

This will deploy a fully-functional Shareabouts map and datastore to your account on Heroku (an easy-to-manage hosting service). Hosting this way will cost $50-100 monthly. [Here's the process](https://github.com/openplans/shareabouts/blob/master/doc/HEROKU_BUTTON.md).

Alternatively, you may want to use a [different hosting service](https://github.com/openplans/shareabouts/blob/master/doc/DEPLOY.md) and set up the components of Shareabouts manually.


Documentation
-------------
All of our documentation is is our `doc` directory. Use it to learn more about:
* [the architecture](https://github.com/openplans/shareabouts/blob/master/doc/ARCHITECTURE.md)
* [local setup](https://github.com/openplans/shareabouts/blob/master/doc/README.md)
* [testing the source](https://github.com/openplans/shareabouts/blob/master/doc/TESTING.md)
* [interface configuration](https://github.com/openplans/shareabouts/blob/master/doc/CONFIG.md)
* [custom themes](https://github.com/openplans/shareabouts/blob/master/doc/CUSTOM_THEME.md)
* [deploying with the Heroku button](https://github.com/openplans/shareabouts/blob/master/doc/HEROKU_BUTTON.md) and [in other ways](https://github.com/openplans/shareabouts/blob/master/doc/DEPLOY.md)
* [upgrading from an older version](https://github.com/openplans/shareabouts/blob/master/doc/UPGRADE.md)
* [getting your data once you have a map running](https://github.com/openplans/shareabouts/blob/master/doc/GETTING_YOUR_DATA.md)

Questions? Problems? Ideas? 
--------------------

If you encounter a bug, [create an issue](https://github.com/openplans/shareabouts/issues) on this GitHub repo.

Contributing
------------
In the spirit of [free software](http://www.fsf.org/licensing/essays/free-sw.html), **everyone** is encouraged to help improve this project.

Here are some ways *you* can contribute:

* by joining our developers discussion list: http://groups.google.com/group/shareabouts-dev
* by taking a look at our pipeline in the public tracker: https://www.pivotaltracker.com/projects/398973
* by using alpha, beta, and prerelease versions
* by reporting bugs
* by suggesting new features
* by writing or editing documentation
* by writing specifications
* by writing code (**no patch is too small**: fix typos, add comments, clean up inconsistent whitespace)
* by refactoring code
* by resolving issues
* by reviewing patches

Credits
-------------
Shareabouts is a project of [OpenPlans](http://openplans.org).
