# Public portfolio statistics updater

The Cloudflare Worker starts this GitHub job through workflow_dispatch every five minutes. GitHub's native cron is deliberately not used because observed runs were hours apart. The job fetches public Roblox and Discord statistics outside Cloudflare and publishes signed snapshots directly to luc-lukas.com.

The original likegoal API files are unchanged. This job has read-only repository access and permission to request a short-lived OIDC identity. It does not commit periodic data or deploy the website.

Cloudflare needs a fine-grained GitHub token with Actions read/write access only to this repository, stored as the runtime secret GITHUB_ACTIONS_TOKEN. The token starts this existing workflow; it is never sent to browsers or included here. The health endpoint reports the dispatch status without exposing credentials.
