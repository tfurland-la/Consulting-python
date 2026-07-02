"""Desktop app for the CCA-F practice exam.

Opens exam.html in a native window (pywebview) and exposes a small Python API
to the page: question generation through the local Claude Code CLI, and
progress persistence to exam_progress.json (gitignored). Run it with:

    python3 practice-exam/exam_app.py

Requires `pip install pywebview` and an authenticated Claude Code CLI for
dynamic generation; without the CLI the app still runs from the question bank.
"""

import json
import os
import sys
from pathlib import Path

import webview

import exam_lib

WINDOW_TITLE = "CCA-F Adaptive Practice Exam"


def _user_data_dir():
    home = Path.home()
    if sys.platform == "darwin":
        base = home / "Library" / "Application Support"
    elif sys.platform.startswith("win"):
        base = Path(os.environ.get("APPDATA", str(home)))
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", str(home / ".local" / "share")))
    return base / "ccaf-practice-exam"


def _resolve_progress_path():
    """Running from a checkout, progress sits next to the code (gitignored).
    A frozen executable can't write into its own bundle, so progress moves to
    the platform's user-data directory."""
    if getattr(sys, "frozen", False):
        data_dir = _user_data_dir()
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_dir / "exam_progress.json"
    return exam_lib.PRACTICE_EXAM_DIR / "exam_progress.json"


PROGRESS_PATH = _resolve_progress_path()


class ExamApi:
    """Bridge methods exposed to the page as window.pywebview.api.*.

    pywebview runs each call on its own thread, so a slow generate() never
    blocks the UI; the page receives a promise per call.
    """

    def health(self):
        available = exam_lib.find_claude() is not None
        return {"ok": True, "claude": "available" if available else "missing"}

    def generate(self, task_statement):
        try:
            bank = exam_lib.load_bank()
            avoid = [
                exam_lib.summarize_for_avoid(q)
                for q in bank
                if q["taskStatement"] == task_statement
            ]
            return {"question": exam_lib.generate_question(task_statement, avoid=avoid)}
        except Exception as err:  # surfaced to the page as a friendly error
            return {"error": type(err).__name__, "detail": str(err)}

    def load_state(self):
        if PROGRESS_PATH.exists():
            return json.loads(PROGRESS_PATH.read_text(encoding="utf-8"))
        return None

    def save_state(self, state):
        tmp = PROGRESS_PATH.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(state, indent=2), encoding="utf-8")
        tmp.replace(PROGRESS_PATH)
        return True


def selfcheck():
    """Print bundle/environment diagnostics as JSON and exit. Lets a built
    executable be verified from a terminal without driving the window."""
    resources = {
        name: (exam_lib.RESOURCE_DIR / name).exists()
        for name in ("exam.html", "adaptive.js", "questions.js", "generation_prompt.md")
    }
    print(
        json.dumps(
            {
                "frozen": bool(getattr(sys, "frozen", False)),
                "resource_dir": str(exam_lib.RESOURCE_DIR),
                "resources": resources,
                "claude": exam_lib.find_claude(),
                "progress_path": str(PROGRESS_PATH),
            },
            indent=2,
        )
    )


def main():
    # The #desktop fragment tells exam.html to wait for the bridge before
    # drawing its first question, so state always loads from the progress
    # file first (no race with an early answer).
    webview.create_window(
        WINDOW_TITLE,
        f"file://{exam_lib.RESOURCE_DIR / 'exam.html'}#desktop",
        js_api=ExamApi(),
        width=1180,
        height=860,
    )
    webview.start()


if __name__ == "__main__":
    if "--selfcheck" in sys.argv:
        selfcheck()
    else:
        main()
