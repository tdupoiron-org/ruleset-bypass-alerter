# ruleset-bypass-notifier

change

## Goal

The purpose of this repository is to show how we can use the Rules Suites API to get notifications when a Ruleset was bypassed by a user.

## Documentation

The Rule Suites API is referenced [here](https://docs.github.com/en/rest/orgs/rule-suites?apiVersion=2022-11-28#list-organization-rule-suites) in the documentation.
This project uses the Javascript SDK called [Octokit](https://octokit.github.io/rest.js/v20).

## Flow

1. A Ruleset is defined at the Organization level with ByPass options.
2. Every day, a script is triggered by GitHub Actions, looking for people who bypassed this rule
3. For each of them, an issue is created in the corresponding repository to request a justification.

## Authentication and Permissions

The script uses a GitHub App to get rule suites at the org level and write issues.
It must have the following permissions: 
* Read access to metadata
* Read and write access to issues
* Read and write access to organization administration

3 Secrets must be set in the repository hosting the script:
* RULESET_BYPASS_ALERTER_APPID
* RULESET_BYPASS_ALERTER_INSTALLATIONID
* RULESET_BYPASS_ALERTER_PRIVATEKEY

## Usage

* Create a GitHub App as described above
* Install the GitHub App in the watched organization, and grant permissions to the targetted repositories.
* Create the 3 secrets
* Fork this code into the same organization
* Enable GitHub Actions

Every day at midnight, the script will start, looking for bypass events.
For each event found, it will smartly create an issue in the impacted repository, mentioning the author that these events must be taken carefully.
