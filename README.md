## A Simple demo to illustrate user controlled updates

### How it works

resin.io is an update mechanism for embedded devices. It allows you to push an app in the form of a container to a device with a Heroku-style work flow (git push resin master).

Ordinarily resin devices download and automatically start whenever a developer pushes new code. However, there is a feature which allows you to write a `lockfile` on the device which prevents these automatic updates. This demo is a simple illustration of how you enable end-users to control when their devices receive the new update.

For more info read the [full write up](https://resin.io/blog/end-user-controlled-updates)
