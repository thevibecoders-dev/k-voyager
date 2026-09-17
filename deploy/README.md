# VPS deployment

Production: https://k-voyager.thevibecoders.app

Every push to `main` runs GitHub Actions: locked npm install, tests, build, deterministic archive, restricted SSH upload, local health check, public revision check and read-only neighbor checks. `workflow_dispatch` reruns deployment. Actions only has `contents: read` permission. Production environment secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`. Never put values in Git.

Unlike KiDo's dynamic server, Voyager is static. Its own read-only, non-root Caddy container serves immutable build directories. Deployments atomically replace the `current` symlink, without restarting this container, KiDo or the shared proxy. The container image is digest-pinned and resource-limited. Port 8787 is loopback-only for health checks; HTTPS is handled by the existing shared proxy.

VPS root: `/home/vibecoders/k-voyager`. Infrastructure files are installed under `deploy/`; they are administrator-managed and deliberately NOT overwritten by CI. The CI SSH key has a forced command for the fixed receiver and cannot open a shell, forward ports, run Docker or modify proxy configuration. Uploaded archives allow only regular static files and directories under `dist`, verify SHA-256, restrict sizes and reject traversal/symlinks. Releases remain for rollback; monitor disk space and remove only explicitly selected obsolete releases when appropriate.

The shared `/opt/proxy/Caddyfile` receives `proxy-route.caddy` once, after snapshot, validation and a graceful reload. Never recreate the shared proxy during app deployments. A pre-change snapshot is retained under `/home/vibecoders/deploy-backups/`.

## Manual rollback

From a trusted admin SSH session, read `PREVIOUS_REVISION`, then invoke the installed receiver with `SSH_ORIGINAL_COMMAND="rollback <full-40-character-SHA>" python3 /home/vibecoders/k-voyager/deploy/receive-release.py`. Only an existing release can be activated. Verify `/release.json` afterwards. Failed internal health checks automatically restore the previously active release.

Sources: [GitHub Actions syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Caddy reload/validate](https://caddyserver.com/docs/command-line).
