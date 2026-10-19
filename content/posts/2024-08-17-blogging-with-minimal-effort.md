---
title: Blogging on GitHub Pages with minimal effort
description: Thinking about starting a blog but worried it’s too time-consuming? Learn how to launch a fully functional blog on GitHub Pages and post with minimal effort.
tags: [asciidoc, blogging, dependabot, giscus, github actions, github pages, jekyll, minimal mistakes, syntax highlighting]
---

![Blogging with minimal effort](/assets/images/posts/blogging-with-minimal-effort/header.png)

> [!NOTE]
> This blog moved to Hugo and Markdown in October 2026.
> The [template](https://github.com/gwenneg/blog-jekyll-asciidoc-template) in this post still uses Jekyll, AsciiDoc and Minimal Mistakes.

I recently chose to start my own dev blog with one key requirement: posting should require minimal effort.
I spent a significant amount of time researching and testing before I was finally satisfied with the result.
In this post, I'll save you that effort and demonstrate the fastest way to create a blog similar to mine.

Are you ready to publish your first post in no time?
Let's get started!

## Initiating the blog from a template repository

First, let's set up a GitHub repository for your blog with the [template](https://github.com/gwenneg/blog-jekyll-asciidoc-template) I created from my own blog.
That template depends on [Jekyll](https://jekyllrb.com), [AsciiDoc](https://asciidoc.org), the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes) theme and GitHub Actions.
Don't worry about the technical details yet, we'll cover that later in this post.

For now, simply follow the steps below to use the [template](https://github.com/gwenneg/blog-jekyll-asciidoc-template):

![How to use the template repository](/assets/images/posts/blogging-with-minimal-effort/use-template.png)

You will be asked for a repository name.
Please make sure the value you provide matches the following pattern:

```
your_github_username.github.io <1>
```

1. Replace `your_github_username` with your actual GitHub username.
   For example, my blog repository is named `gwenneg.github.io` because my GitHub username is `gwenneg`.
{.callouts}

> [!WARNING]
> GitHub Pages only work with public repositories, so please don't make your repo private or your blog won't be published!

After your repo is created, GitHub will immediately try and fail to deploy your blog from a GitHub Action:

![Deployment failure](/assets/images/posts/blogging-with-minimal-effort/deployment-failure.png)

Don't worry about that failure.
We'll set up the actual deployment of your blog [later](#deploying).

We're done initiating your blog and it already has its own repo!
Be sure to clone the repo before proceeding to the next section.

## Setting the minimal configuration before the first deployment

Before your blog can be deployed, you’ll need to make a few adjustments to the `_config.yml` file in your repo.
Pay special attention to any lines marked with `# FIXME […]` as these require immediate action.
Most comments should be self-explanatory, and the file also includes many links to relevant sections of the Minimal Mistakes [documentation](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/).
These links should help address any questions you might have.

## Deploying the blog {#deploying legacy="deploying-the-blog"}

> [!WARNING]
> Once you’ve completed this section, your posts will be visible to anyone who visits your blog.
> Be sure you're ready for that!
> If you prefer to keep a post unpublished, you can do so by adding `:page-published: false` to the post’s headers.

Until now, the deployment of your blog was intentionally disabled in the `jekyll` GitHub workflow provided by the template repo.
It's time to enable it by deleting [this line](https://github.com/gwenneg/blog-jekyll-asciidoc-template/blob/8d07da46301b34c822500cdeeed70e6046894a7c/.github/workflows/jekyll.yml#L57) in your repo.
Once removed, GitHub will immediately start deploying your blog.
You should soon see a successful GitHub Action run similar to this one:

![Deployment success](/assets/images/posts/blogging-with-minimal-effort/deployment-success.png)

Although GitHub just deployed your blog using a GitHub Action, it will still try (and fail) to deploy it "from a branch" as well.
We need to let it know that the blog will exclusively be deployed through the GitHub Action.
Here's how you can do that:

![Deployment success](/assets/images/posts/blogging-with-minimal-effort/deployment-source.png)

That's it for the minimal deployment config of your blog!
From now on, as long as you don't modify the `jekyll` workflow in your repo, GitHub will automatically redeploy the blog whenever you push changes to the `main` branch.

If you want to better understand or customize the deployment configuration, the [GitHub doc](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) should have all the information you need.
Finally, [here](https://github.com/actions/starter-workflows/blob/main/pages/jekyll.yml) is the source of the `jekyll` workflow provided by the template repo.

> [!NOTE]
> All sections beyond this point are optional reading.
> You don't _have_ to go through them before publishing your first post.
> However, it’s still recommended, as they provide valuable insights into how the blog functions and how you can customize it.

## A quick look under the hood

### Introducing Jekyll

As I wrote in a previous section, the blog depends on [Jekyll](https://jekyllrb.com).

Jekyll is a widely-used static site generator with built-in support for GitHub Pages.
It's not the only option for publishing a blog on GitHub Pages.
There are several other alternatives available.
Since I haven't tested those alternatives, I can't offer recommendations or comparisons.
In this post, I'll focus solely on Jekyll.

When I first started learning about Jekyll, something made me a bit uneasy: it requires a Ruby runtime and Ruby commands to build and test the blog locally.
Having never used Ruby before, I was initially hesitant.
Now that I'm more experienced with Jekyll, I can assure you that it's pretty easy to use with zero knowledge of Ruby.
Besides the initial local environment setup which is [well-documented](https://jekyllrb.com/docs), you will primarily rely on a single shell command to test your blog:

```shell
bundle exec jekyll serve <1>
```

1. This command builds the blog and makes it available for testing at <http://localhost:4000>.
{.callouts}

> [!TIP]
> Many resources, including the [GitHub documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll), recommend using the [github-pages](https://rubygems.org/gems/github-pages) gem to build a Jekyll-based blog hosted on GitHub Pages.
> Not only is that not required, but it might even be a bad idea in the long run.
> Indeed, the [pages-gem](https://github.com/github/pages-gem) repo isn't as actively maintained as it used to be.
> The `github-pages` gem also relies on [outdated dependencies](https://pages.github.com/versions) such as Jekyll 3, despite newer versions like Jekyll 4 being available for years.
> For these reasons, this blog was intentionally _not_ built using the `github-pages` gem.
> Instead, it depends on the [jekyll](https://rubygems.org/gems/jekyll) gem to take advantage of the latest improvements in Jekyll 4.

### Introducing AsciiDoc

Jekyll natively supports the Markdown markup language but I wanted the blog to also support [AsciiDoc](https://asciidoc.org), as I strongly prefer it for writing technical posts.
As a result, the blog is set up to handle both markup languages.
If you’re unsure which format is best for you, [this article](https://docs.asciidoctor.org/asciidoc/latest/asciidoc-vs-markdown) from AsciiDoctor Docs can help you make that decision.

### Introducing Minimal Mistakes

The blog depends on the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes) remote theme:

```yaml {title="_config.yml"}
remote_theme: mmistakes/minimal-mistakes@4.26.2
```

That theme was created by [Michael Rose](https://github.com/mmistakes).
It's 100% free, highly customizable, fully responsive and extensively [documented](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide).

The Minimal Mistakes source code is available in the [mmistakes/minimal-mistakes](https://github.com/mmistakes/minimal-mistakes) repository.

## Customizing the theme

Before diving into theme customization for your blog, have you explored [all the skins](https://mmistakes.github.io/minimal-mistakes/docs/configuration/#skin) offered by Minimal Mistakes?
If you haven’t made any changes yet, your blog is currently using the `default` skin:

```yaml {title="_config.yml"}
minimal_mistakes_skin: default <1>
```

1. Additional skins are available: `air`, `aqua`, `contrast`, `dark`, `neon`, `mint`, `plum` and `sunrise`.
{.callouts}

Once you've chosen a skin, you may want to further customize your blog's style by adding or overriding CSS rules.
While the Minimal Mistakes documentation [covers this](https://mmistakes.github.io/minimal-mistakes/docs/stylesheets) thoroughly, I opted for a different approach.
It may not be as polished as the recommended method, but requires significantly less effort when only minimal changes are needed.

Minimal Mistakes provides an empty [_includes/head/custom.html](https://github.com/mmistakes/minimal-mistakes/blob/master/_includes/head/custom.html) file that you can use to customize the HTML content within your blog’s `head` tag.
That's how I introduced my own CSS rules:

```html {title="/_includes/head/custom.html"}
<link rel="stylesheet" href="/assets/css/rouge/base16.monokai.dark.css">
<link rel="stylesheet" href="/assets/css/custom.css"> <1>
```

1. This file contains all custom CSS rules applied on top of the Minimal Mistakes skin.
{.callouts}

You might also consider [customizing the layouts](https://mmistakes.github.io/minimal-mistakes/docs/overriding-theme-defaults) offered by Minimal Mistakes.
However, that requires more effort than I aimed for with this blog, so what you’re reading now uses the default layouts with no custom changes.

## Enabling comments in your posts {#comments legacy="enabling-comments-in-your-posts"}

Comments are not enabled in your blog posts yet.
To enable them, you'll need to update the `_config.yml` file in your repo:

```yaml {title="_config.yml"}
defaults:
  - scope:
      path: ""
      type: posts
    values:
      comments: false <1>
```

1. Set this value to `true` to enable comments in all posts.
{.callouts}

You will also need to select and configure a [comment provider](https://mmistakes.github.io/minimal-mistakes/docs/configuration/#comments) supported by the Minimal Mistakes theme.
I chose Giscus which relies on GitHub Discussions to manage comments.
It's open source, free and highly customizable.
If you plan on using that provider, I recommend reviewing [this documentation](https://mmistakes.github.io/minimal-mistakes/docs/configuration/#giscus-comments) from Minimal Mistakes first.

> [!NOTE]
> The [giscus.app](https://giscus.app) site suggests adding a `<script>` tag where the comments should appear.
> That is not required when using Minimal Mistakes.
> You don't need to change any layouts from the theme to enable the comments.

Here's how your `_config.yml` file should look like after adding the config values provided by [giscus.app](https://giscus.app):

```yaml {title="_config.yml from gwenneg.github.io"}
comments:
  giscus:
    category_name: Blog posts <1>
    category_id: DIC_kwDOL32gyc4ChLma <2>
    discussion_term: "og:title" <3>
    reactions_enabled: "1" <4>
    repo_id: R_kgDOL32gyQ <5>
    theme: light <6>
  provider: giscus
```

1. You don't _have_ to use one of the default discussion categories provided by GitHub.
   This one is a custom category.
2. Replace this with the value provided by [giscus.app](https://giscus.app).
3. This determines the title of each discussion in GitHub Discussions.
4. This allows users to react with emojis in addition to posting comments.
5. Replace this with the value provided by [giscus.app](https://giscus.app).
6. A preview of each theme is available in [giscus.app](https://giscus.app).
{.callouts}

That's all you need to do to enable comments in your posts.

## Improving the readability of your posts

### Making important information stand out with admonitions

[Admonitions](https://docs.asciidoctor.org/asciidoc/latest/blocks/admonitions) from AsciiDoc are an excellent way to make important information stand out in your posts:

> [!TIP]
> This is a `TIP` admonition.

Here is the AsciiDoc syntax behind it:

```asciidoc
[TIP] <1>
====
This is a `TIP` admonition.
====
```

1. Additional admonition types are supported: `NOTE`, `WARNING`, `IMPORTANT` and `CAUTION`.
{.callouts}

> [!NOTE]
> Did you notice the `Copy to clipboard` button in the top-right corner of all code blocks?
> That feature is provided by the blog theme, [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/docs/configuration/#code-block-copy-button).

All admonitions in your blog rely on icons from Font Awesome.
You can customize both the icon and its color for each admonition type in the `assets/css/custom.css` file:

```css {title="assets/css/custom.css"}
.admonitionblock .icon-tip::before {
    color: #f6cc40;
    content: "\f0eb"; <1>
}
```

1. This determines which icon from Font Awesome is used.
{.callouts}

### Commenting code blocks with callouts

[Callouts](https://docs.asciidoctor.org/asciidoc/latest/verbatim/callouts/) from AsciiDoc can be used to provide additional information about a specific line of code:

```java
import java.util.Random; // <1>

public class NotSoRandom {
    public void run() {
        Random random = new Random(-6732303926L);
        for (int i = 0; i < 10; i++)
            System.out.println(random.nextInt(10)); // <2>
        }
    }
}
```

1. Don't do this at home!
   You should always use [java.security.SecureRandom](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/SecureRandom.html) when you need a truly random number in Java.
2. Can you guess what will be printed?
{.callouts}

Here is the AsciiDoc syntax behind that code block:

```asciidoc
[source, java]
----
import java.util.Random; // \<1>

public class NotSoRandom {
    public void run() {
        Random random = new Random(-6732303926L);
        for (int i = 0; i < 10; i++)
            System.out.println(random.nextInt(10)); // \<2>
        }
    }
}
----
<1> Don't do this at home!
You should always use https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/SecureRandom.html[java.security.SecureRandom^] when you need a truly random number in Java.
<2> Can you guess what will be printed?
```

### Changing the syntax highlighting theme in code blocks

Code blocks from your blog are highlighted with [Rouge](https://docs.asciidoctor.org/asciidoctor/latest/syntax-highlighting/rouge), a build-time syntax highlighter written in Ruby which supports over [200 languages](https://rouge-ruby.github.io/docs/file.Languages.html).

The blog depends on [one of the many themes](https://spsarolkar.github.io/rouge-theme-preview) available in Rouge:

```html {title="_includes/head/custom.html"}
<link rel="stylesheet" href="/assets/css/rouge/base16.monokai.dark.css"> <1>
<link rel="stylesheet" href="/assets/css/custom.css">
```

1. This is how the `base16.monokai.dark` theme from Rouge is applied to the blog.
{.callouts}

To change the theme, you will need to use a different CSS file from Rouge.
While the CSS files can be downloaded from third-party sources, there is a way to generate them directly from the command line:

```shell
gem install rouge <1>
rougify help style <2>
rougify style thankful_eyes > thankful_eyes.css <3>
```

1. This installs the [rouge](https://rubygems.org/gems/rouge) gem on your machine.
2. This lists all themes available in Rouge.
3. This generates the CSS file for the `thankful_eyes` theme and saves the output as `thankful_eyes.css`.
{.callouts}

## Updating dependencies automatically with Dependabot

Keeping dependencies up to date is important for addressing security vulnerabilities, fixing bugs, and taking advantage of enhancements or new features.
Although this process can be time-consuming, your repository already benefits from some automation through GitHub’s [Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates).
When a new version of a blog dependency becomes available, Dependabot will automatically create a pull request similar to [gwenneg.github.io#22](https://github.com/gwenneg/gwenneg.github.io/pull/22).
All you will need to do is test the PR and then merge it.

Here's how Dependabot is configured in your repo:

```yaml {title=".github/dependabot.yml"}
version: 2
updates:
  - package-ecosystem: "bundler" <1>
    directory: "/"
    schedule:
      interval: "weekly" <2>
  - package-ecosystem: "github-actions" <3>
    directory: "/"
    schedule:
      interval: "weekly"
```

1. This will automatically update the Ruby gems the blog depends on.
2. Dependabot will check for newer versions on Monday each week.
   [Additional intervals](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#scheduleinterval) are available.
3. This will automatically update the GitHub Actions from the blog repo.
{.callouts}

## Conclusion

Setting up a blog on GitHub Pages doesn’t have to be a daunting task.
With the right tools, templates, and a bit of guidance, you can have your blog up and running with minimal effort.
By leveraging the built-in features of Jekyll and the Minimal Mistakes theme, you can focus on what truly matters - creating content - without getting lost in the technical details.

Whether you’re new to blogging or just looking for a simpler way to manage your site, I hope this guide has shown you that it’s easier than you think to get started.

Now, all that’s left is to share your thoughts with the world. Happy blogging!
