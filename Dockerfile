# Multi-stage build:
#   1. node:20-alpine builds the static Astro site. The src/content/guides
#      symlink → ../../vendor/mcp-rune/docs/guides resolves inside the
#      Docker context because kamal clones the repo with --recurse-submodules,
#      populating vendor/mcp-rune/ from github.com:mcp-rune/mcp-rune.
#   2. nginx:alpine serves the resulting dist/.
#
# Nothing pre-built on the host is shipped: dist/ stays out of git and is
# regenerated from source on every image build.

FROM node:20-alpine AS build
WORKDIR /app

# Install deps in a dedicated layer so it caches across content-only changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The /roadmap page reads GITHUB_TOKEN_MCP_RUNE at build time to fetch
# milestones + issues from the private mcp-rune/mcp-rune repo. Kamal
# forwards the secret via `builder.secrets` in config/deploy.yml; locally
# you can `docker build --secret id=GITHUB_TOKEN_MCP_RUNE,src=<path>`. If
# the secret is absent, Astro falls back to the empty-state Roadmap and
# the rest of the site builds normally — that's why we tolerate a missing
# mount with `|| true`.
RUN --mount=type=secret,id=GITHUB_TOKEN_MCP_RUNE \
    GITHUB_TOKEN_MCP_RUNE="$(cat /run/secrets/GITHUB_TOKEN_MCP_RUNE 2>/dev/null || true)" \
    npm run build && test -f dist/index.html

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
