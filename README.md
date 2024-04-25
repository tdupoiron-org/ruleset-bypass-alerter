# ruleset-bypass-notifier

## Goal

The purpose of this repository is to show how we can use the Rules Suites API to get notifications when a Ruleset was bypassed by a user.

## Components

1 - A GitHub ruleset defined at the organization level
2 - A javascript code wrapped into a GitHub Action hosted in this repository
3 - A GitHub workflow running every 5 minutes, using this action to check if a new rule was bypassed

## Flow

If a user decides to bypass a rule, the workflow running on a regular schedule will capture this event and open an issue in this repository, mentioning organization admin and commit author.