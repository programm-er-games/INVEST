from __future__ import annotations

import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path
from urllib.parse import urlsplit


class GitSourceError(ValueError):
    pass


_REF_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")


def _canonical_https_url(value: str) -> str:
    try:
        parsed = urlsplit(value.strip())
        if (
            parsed.scheme.lower() != "https"
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.port is not None
            or parsed.query
            or parsed.fragment
        ):
            raise GitSourceError(
                "Only credential-free HTTPS repository URLs are supported"
            )
        if not parsed.path or parsed.path == "/":
            raise GitSourceError("Repository URL must include an owner and repository")
        path = parsed.path.rstrip("/")
        parts = [part for part in path.split("/") if part]
        if len(parts) == 2 and parts[1].endswith(".git"):
            parts[1] = parts[1][:-4]
        if len(parts) != 2 or any(part in {"", ".", ".."} for part in parts):
            raise GitSourceError("Repository URL must point to one owner/repository")
        return f"https://{parsed.hostname.lower()}/{parts[0]}/{parts[1]}"
    except ValueError as exc:
        raise GitSourceError("Invalid repository URL") from exc


def _validate_ref(ref: str | None) -> str | None:
    if ref is None or ref == "":
        return None
    if (
        not _REF_PATTERN.fullmatch(ref)
        or ".." in ref
        or "//" in ref
        or "@{" in ref
        or ref.endswith("/")
        or ref.endswith(".")
        or ref.endswith(".lock")
        or any(part.startswith(".") for part in ref.split("/"))
    ):
        raise GitSourceError("Invalid Git branch or tag name")
    return ref


def clone_allowed_repository(
    url: str,
    ref: str | None,
    workspace_root: str | Path,
    allowed_targets: set[str],
) -> dict:
    canonical_url = _canonical_https_url(url)
    allowed = {_canonical_https_url(item) for item in allowed_targets}
    if canonical_url not in allowed:
        raise GitSourceError("Repository is not present in ALLOWED_TARGETS")

    safe_ref = _validate_ref(ref)
    root = Path(workspace_root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    destination = root / f"git-{uuid.uuid4().hex}"
    disabled_hooks = root / ".git-hooks-disabled"
    args = [
        "git",
        "-c",
        f"core.hooksPath={disabled_hooks}",
        "-c",
        "core.fsmonitor=false",
        "-c",
        "core.autocrlf=false",
        "-c",
        "protocol.file.allow=never",
        "-c",
        "submodule.recurse=false",
        "-c",
        "http.followRedirects=false",
        "-c",
        "filter.lfs.smudge=",
        "-c",
        "filter.lfs.process=",
        "clone",
        "--depth",
        "1",
        "--single-branch",
        "--no-tags",
        "--no-recurse-submodules",
    ]
    if safe_ref:
        args.extend(["--branch", safe_ref])
    args.extend([canonical_url, str(destination)])

    env = {
        "PATH": os.environ.get("PATH", ""),
        "GIT_TERMINAL_PROMPT": "0",
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": os.devnull,
        "GIT_LFS_SKIP_SMUDGE": "1",
        "GIT_ALLOW_PROTOCOL": "https",
        "GIT_OPTIONAL_LOCKS": "0",
    }
    for key in ("SYSTEMROOT", "WINDIR", "HOME", "USERPROFILE", "TEMP", "TMP"):
        if key in os.environ:
            env[key] = os.environ[key]

    try:
        completed = subprocess.run(
            args,
            cwd=root,
            env=env,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
        if completed.returncode != 0:
            detail = (completed.stderr or completed.stdout or "Git clone failed")[-500:]
            raise GitSourceError(f"Git clone failed: {detail}")
        if not destination.is_dir() or not (destination / ".git").is_dir():
            raise GitSourceError("Git did not create the expected repository directory")
        return {
            "path": destination.name,
            "source": "git",
            "repository": canonical_url,
            "ref": safe_ref,
        }
    except subprocess.TimeoutExpired as exc:
        shutil.rmtree(destination, ignore_errors=True)
        raise GitSourceError("Git clone exceeded the 120-second time limit") from exc
    except OSError as exc:
        shutil.rmtree(destination, ignore_errors=True)
        raise GitSourceError(
            "Git executable is unavailable or could not start"
        ) from exc
    except Exception:
        shutil.rmtree(destination, ignore_errors=True)
        raise
