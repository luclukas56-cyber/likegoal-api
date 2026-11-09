# Portfolio statistics updater

This folder is added alongside the existing likegoal API. It fetches public Roblox and Discord counts and publishes them directly to luc-lukas.com using a short-lived GitHub Actions OIDC identity. No long-lived account tokens or customer data are stored here.

The workflow requests a run every five minutes, offset from the top of the hour. GitHub can delay scheduled jobs. Failed sources retain their actual successful timestamps in the portfolio's shared database. Browser reloads cannot launch a workflow or provider request.

The original API source and package configuration are preserved. The workflow has read-only repository access and permission to request its job identity; it does not commit periodic data files or deploy the website.

The production schedule runs from main. A separate maintenance job keeps the scheduled workflow enabled without committing data or modifying the API. Only that maintenance job has Actions-write access; the publisher itself keeps read-only repository access.
