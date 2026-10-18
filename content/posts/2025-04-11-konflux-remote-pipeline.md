---
title: Easing the maintenance of Konflux build pipelines
description: "Maintaining Konflux pipelines doesn’t have to be a pain. I’ve got a few tips to help you out."
tags: [konflux]
---

[Konflux](https://konflux-ci.dev) is an open source, cloud-native software factory developed by Red Hat and focused on software supply chain security.

When a component is [onboarded to Konflux](https://konflux-ci.dev/docs/building/creating), the [Red Hat Konflux app](https://github.com/apps/red-hat-konflux) automatically creates two build pipelines in the Git repository:

- `${component.name}-pull-request.yaml`
- `${component.name}-push.yaml`

Then, every once in a while, [MintMaker](https://github.com/konflux-ci/mintmaker) — a Konflux hosted instance of the [Renovate bot](https://github.com/renovatebot/renovate) — will open PRs to update the Konflux task references in the pipelines.
Some of these PRs may also include [migration notes](https://github.com/RedHatInsights/konflux-pipelines/pull/58) and require additional work.

If you're managing multiple repositories onboarded to Konflux, keeping all the pipelines up to date can require significant effort over time.
In this post, I'll show you different ways to make pipeline maintenance easier by using remote pipelines and tweaking MintMaker's settings.

> [!WARNING]
> This post includes multiple references to the [RedHatInsights/konflux-pipelines](https://github.com/RedHatInsights/konflux-pipelines) repository.
> If you're not a member of the RedHatInsights organization on GitHub, please consider forking the repository before using the remote pipelines it contains, as they may be modified at any time without prior notice.

## Introducing remote pipelines

[Remote pipelines](https://tekton.dev/docs/pipelines/resolution) from Tekton let you reference pipeline definitions stored in external Git repositories instead of defining them locally in each project.
They make it easier to share and maintain pipelines across multiple repositories.

Konflux is built on top of Tekton.
Let's see how we can leverage remote pipelines in a Konflux build pipeline!

Nothing shows it better than a good PR: [gwenneg/blog-remote-konflux-pipeline#2](https://github.com/gwenneg/blog-remote-konflux-pipeline/pull/2/files).
If you don't have time to review the whole thing, here's the TL;DR:

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  annotations:
    pipelinesascode.tekton.dev/pipeline: > # <1>
      https://github.com/RedHatInsights/konflux-pipelines/raw/main/pipelines/docker-build-oci-ta.yaml
    # Additional annotations omitted for brevity
  labels: ... # Omitted for brevity
  name: remote-konflux-pipeline-on-pull-request
  namespace: glepage-tenant
spec:
  params: ... # Omitted for brevity
  pipelineRef: # <2>
    name: docker-build-oci-ta # <3>
  workspaces: ... # Omitted for brevity
```

1. This annotation comes from [Pipelines as Code](https://pipelinesascode.com/docs/guide/resolver/#remote-pipeline-annotations) and references a remote pipeline from the [RedHatInsights/konflux-pipelines](https://github.com/RedHatInsights/konflux-pipelines) repository.
2. The entire `pipelineSpec` section from the default Konflux pipeline is replaced with a minimal `pipelineRef` section.
3. This value needs to match the `metadata.name` value from the remote pipeline.
{.callouts}

### Why go remote?

After applying the changes shown above:

- MintMaker will no longer open PRs in your repository to update Konflux task references or request pipeline migrations.
- Your pipeline runs will automatically depend on the latest version of the remote pipelines, thanks to the dependency on the `main` branch.
- MintMaker will still open PRs unrelated to pipelines, such as [RedHatInsights/sources-api-go#835](https://github.com/RedHatInsights/sources-api-go/pull/835), to update dependencies.

> [!TIP]
> If you want to test a change in a remote pipeline or roll back to an earlier version if something breaks, just point to a different Git branch or SHA.

### There's a catch

This approach almost entirely removes the need to maintain pipelines, but there's a catch.
Since MintMaker won't open PRs to update your pipelines anymore, any changes in the remote pipelines will go untested in your repository until you open another unrelated PR that triggers a pipeline run.

The next section explains how to work around this limitation.

## Depending on a specific release of remote pipelines

If the repository that hosts the remote pipelines publishes releases on GitHub, your repository can depend on a specific release instead of always using the latest version.

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  annotations:
    pipelinesascode.tekton.dev/pipeline: > # <1>
      https://github.com/RedHatInsights/konflux-pipelines/raw/v1.2.0/pipelines/docker-build-oci-ta.yaml
    # Additional annotations omitted for brevity
  labels: ... # Omitted for brevity
  name: remote-konflux-pipeline-on-pull-request
  namespace: glepage-tenant
spec:
  params: ... # Omitted for brevity
  pipelineRef:
    name: docker-build-oci-ta
  workspaces: ... # Omitted for brevity
```

1. The local pipeline now depends on version `v1.2.0` of the remote pipeline instead of `main`.
{.callouts}

With this approach:

- MintMaker will automatically open PRs such as [gwenneg/blog-remote-konflux-pipeline#4](https://github.com/gwenneg/blog-remote-konflux-pipeline/pull/4) in your repository every time a new release of the remote pipelines is published.
- Any changes in the remote pipelines will be immediately tested in your repository and you will catch issues as early as possible.
- You still won't have to worry about Konflux task reference updates or pipeline migrations.

## Customizing MintMaker's settings

> [!TIP]
> You can use the tips from this section whether or not you're using remote pipelines.

MintMaker works out of the box in repositories onboarded to Konflux and doesn't require any additional configuration files.
However, it is possible to customize MintMaker's settings by adding a [renovate.json](https://github.com/gwenneg/blog-remote-konflux-pipeline/blob/main/renovate.json) file at the root of your repository.
The default configuration is detailed in the [Konflux doc](https://konflux-ci.dev/docs/mintmaker/default-config).

### Changing when MintMaker runs

The Renovate configuration lets you control when and how often MintMaker may open PRs in your repository:

```json {title="renovate.json"}
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>konflux-ci/mintmaker//config/renovate/renovate.json"], // <1>
  "tekton": {
    "schedule": ["on Tuesday after 3am and before 10am"] // <2>
  }
}
```

1. This snippet extends [https://github.com/konflux-ci/mintmaker/blob/main/config/renovate/renovate.json](https://github.com/konflux-ci/mintmaker/blob/main/config/renovate/renovate.json).
2. Renovate supports both natural language and cron-based scheduling.
   See the [Renovate doc](https://docs.renovatebot.com/configuration-options/#schedule) for more details.
{.callouts}

### Automatically approving and merging MintMaker's PRs

You can also tweak your Renovate settings to automatically approve or [merge](https://github.com/gwenneg/blog-remote-konflux-pipeline/pull/11) PRs opened by MintMaker:

```json {title="renovate.json"}
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>konflux-ci/mintmaker//config/renovate/renovate.json"],
  "tekton": {
    "autoApprove": true, // <1>
    "automerge": true // <2>
  }
}
```

1. Auto-approving only works in GitLab, not in GitHub. Find more details in the [Renovate doc](https://docs.renovatebot.com/configuration-options/#autoapprove).
2. Auto-merging works in both GitHub and GitLab. Find more details in the [Renovate doc](https://docs.renovatebot.com/configuration-options/#automerge).
{.callouts}

## Hosting remote Konflux pipelines

If you plan on creating a repository to host remote pipelines, there are two things you'll need to do:

- Onboard the repository to Konflux as a component.
- Let MintMaker know where to find the remote pipelines so it can keep them updated.

```json {title="renovate.json"}
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>konflux-ci/mintmaker//config/renovate/renovate.json"],
  "tekton": {
    "includePaths": ["pipelines/**"] // <1>
  }
}
```

1. By default, MintMaker only updates pipelines found in the `.tekton` folder.
   To use a different location, you must specify where the remote pipelines are located.
{.callouts}

## Special thanks

Special thanks to [Jiri Popelka](https://github.com/jpopelka) for suggesting the [Pipelines as Code annotation](https://pipelinesascode.com/docs/guide/resolver/#remote-pipeline-annotations) as an alternative to the [Tekton Git resolver](https://tekton.dev/docs/pipelines/git-resolver/#pipeline-resolution).
