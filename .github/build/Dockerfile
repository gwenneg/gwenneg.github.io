# The image the blog is built with, in CI and locally: Hugo and Pagefind, at pinned versions.
# Dependabot opens a pull request when either one has a new version:
# - Hugo is the official image, pinned to a version and its digest on the FROM line.
# - Pagefind comes from npm: package.json pins its version, package-lock.json the checksums of its files.
FROM ghcr.io/gohugoio/hugo:v0.168.0@sha256:1fb8fe7f417abd5802d86747d297728aa48078d763159e7dff6559fe3f8bb8e7

USER root
COPY package.json package-lock.json /opt/pagefind/
# --ignore-scripts: Pagefind needs no install script, so none can run
RUN npm ci --prefix /opt/pagefind --ignore-scripts --no-audit --no-fund
USER hugo:hugo
ENV PATH="/opt/pagefind/node_modules/.bin:$PATH"

# Run the command given to docker run, such as hugo or pagefind. The official image's entrypoint
# would run npm, or a script found in the repository, first.
ENTRYPOINT []
CMD ["hugo", "version"]
