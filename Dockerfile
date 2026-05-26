# Static nginx server for the pre-built Astro site.
#
# The Astro build runs on the host via the kamal pre-build hook
# (.kamal/hooks/pre-build → npm ci && npm run build) so the image stays a
# thin layer on top of nginx:alpine. Building outside the container also
# sidesteps the src/content/guides symlink, which points to
# ../mcp-rune/docs/guides and cannot be resolved from inside a Docker
# build context rooted at this project.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 80
