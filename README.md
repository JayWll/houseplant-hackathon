Houseplant Hackathon
====================

What Is This?
-------------

This project is the result of an afternoon hackathon we ran where I work, the objectives of which were two fold:
* Learn how to write a NodeJS app and deploy it to Google AppEngine
* Connect the plant I have on my desk to the internet

Since creating it I've migrated the project away from AppEngine and on to [Glitch](https://glitch.com) instead.


How Does It Work?
-----------------

The hardware is built around a NodeMCU, which is an Arduino-compatible microcontroller with integrated WiFi. This is connected to a simple analog soil moisture sensor that's inserted into the soil itself. The moisture sensor came with a little circuit to convert the analog signal to a digital one, but it never worked so we threw it away.

![Circuit Diagram](https://cdn.glitch.com/b28f7cff-6fcc-4477-9f53-58cfa415c1e0%2FMoisture%20Sensor.png)

The arduino code takes a reading every hour and sends it to the app on Glitch, where it gets stored in a SQLite database. Once a week a cleanup job is triggered by [cron-job.org](https://cron-job.org) to remove readings older than 90 days from the database.

Both the creation of a new reading and the cleanup cronjob expect that a secret key be included in order to authenticate the request.


Links
-----

* [Live App](https://jasonsplant.glitch.me/)
* [Glitch Project Page](https://glitch.com/~jasonsplant)
* [GitHub Repo](https://github.com/JayWll/houseplant-hackathon)
