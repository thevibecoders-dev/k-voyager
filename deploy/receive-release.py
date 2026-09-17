#!/usr/bin/env python3
"""Forced SSH command: accept only bounded, hashed Voyager static releases."""
import fcntl, hashlib, json, os, pathlib, re, shutil, sys, tarfile, tempfile, time, urllib.request

BASE = pathlib.Path('/home/vibecoders/k-voyager')
MAX_ARCHIVE = 128 * 1024 * 1024
MAX_EXPANDED = 256 * 1024 * 1024

def activate(revision):
    link = BASE / '.current-next'
    link.unlink(missing_ok=True)
    link.symlink_to('releases/' + revision)
    link.replace(BASE / 'current')

def healthy(revision):
    for _ in range(20):
        try:
            with urllib.request.urlopen('http://127.0.0.1:8787/release.json', timeout=3) as r:
                if json.load(r)['revision'] != revision:
                    raise ValueError('revision mismatch')
            with urllib.request.urlopen('http://127.0.0.1:8787/index.html', timeout=3) as r:
                if r.status == 200:
                    return True
        except Exception:
            time.sleep(1)
    return False

def main():
    command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
    match = re.fullmatch(r'(deploy) ([a-f0-9]{40}) ([a-f0-9]{64})', command)
    rollback = re.fullmatch(r'rollback ([a-f0-9]{40})', command)
    if not match and not rollback:
        raise ValueError('Only deploy <SHA> <SHA256> or rollback <SHA> is permitted')
    revision = match[2] if match else rollback[1]
    with (BASE / '.deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        releases = BASE / 'releases'
        releases.mkdir(exist_ok=True)
        destination = releases / revision
        current = BASE / 'current'
        old = current.resolve().name if current.is_symlink() else None
        if match:
            with tempfile.TemporaryDirectory(prefix='incoming-', dir=BASE) as temp:
                temp = pathlib.Path(temp)
                archive = temp / 'release.tar.gz'
                digest, size = hashlib.sha256(), 0
                with archive.open('wb') as out:
                    while chunk := sys.stdin.buffer.read(1024 * 1024):
                        size += len(chunk)
                        if size > MAX_ARCHIVE:
                            raise ValueError('Archive too large')
                        digest.update(chunk)
                        out.write(chunk)
                if digest.hexdigest() != match[3]:
                    raise ValueError('Archive checksum mismatch')
                stage = temp / 'stage'
                stage.mkdir()
                with tarfile.open(archive, 'r:gz') as tar:
                    members = tar.getmembers()
                    if len(members) > 10000 or sum(m.size for m in members) > MAX_EXPANDED:
                        raise ValueError('Expanded archive limit exceeded')
                    seen = set()
                    for member in members:
                        path = pathlib.PurePosixPath(member.name)
                        if path.is_absolute() or not path.parts or path.parts[0] != 'dist' or any(p.startswith('.') for p in path.parts) or '\\' in member.name or not (member.isfile() or member.isdir()):
                            raise ValueError('Unsafe archive entry')
                        if str(path) in seen:
                            raise ValueError('Duplicate archive entry')
                        seen.add(str(path))
                        target = stage.joinpath(*path.parts)
                        if member.isdir():
                            target.mkdir(parents=True, exist_ok=True)
                        else:
                            target.parent.mkdir(parents=True, exist_ok=True)
                            with tar.extractfile(member) as src, target.open('xb') as dst:
                                shutil.copyfileobj(src, dst)
                            target.chmod(0o644)
                release = stage / 'dist'
                metadata = json.loads((release / 'release.json').read_text())
                if metadata.get('revision') != revision or metadata.get('app') != 'k-voyager':
                    raise ValueError('Release identity mismatch')
                for required in ['index.html', 'explorer.js', 'explorer.css', 'data/stars.json', 'data/exoplanets.json']:
                    if not (release / required).is_file():
                        raise ValueError('Incomplete release: ' + required)
                if destination.exists():
                    if (destination / '.archive-sha256').read_text().strip() != match[3]:
                        raise ValueError('Existing immutable revision has different content')
                else:
                    (release / '.archive-sha256').write_text(match[3] + '\n')
                    release.rename(destination)
        if not destination.is_dir():
            raise ValueError('Unknown rollback revision')
        activate(revision)
        if not healthy(revision):
            if old:
                activate(old)
                if not healthy(old):
                    raise RuntimeError('Deployment and rollback health checks failed')
            else:
                current.unlink(missing_ok=True)
            raise RuntimeError('Unhealthy release; previous version restored')
        if old and old != revision:
            (BASE / 'PREVIOUS_REVISION').write_text(old + '\n')
        (BASE / 'DEPLOYED_COMMIT').write_text(revision + '\n')
        print('Healthy release activated:', revision)

if __name__ == '__main__':
    os.umask(0o022)
    try:
        main()
    except Exception as exc:
        print('Deployment refused:', exc, file=sys.stderr)
        sys.exit(1)
