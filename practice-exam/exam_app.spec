# PyInstaller spec for the CCA-F practice exam desktop app.
#
# Build (from the repo root, with pyinstaller installed in the venv):
#
#   .venv/bin/pip install pyinstaller
#   .venv/bin/pyinstaller practice-exam/exam_app.spec --noconfirm \
#       --distpath practice-exam/dist --workpath practice-exam/build
#
# Output on macOS: "practice-exam/dist/CCA-F Practice Exam.app". The bundle
# ships the question bank frozen at build time; the claude CLI is NOT bundled
# — dynamic generation uses the system-installed Claude Code via find_claude()
# (PATH, known install locations, login shell, or the CCAF_CLAUDE override).
# First launch of an unsigned build needs right-click -> Open past Gatekeeper.
# Build artifacts (build/, dist/) are gitignored; don't commit binaries.

import os

DATAS = [
    (os.path.join(SPECPATH, name), ".")
    for name in ("exam.html", "adaptive.js", "questions.js", "generation_prompt.md")
]

a = Analysis(
    [os.path.join(SPECPATH, "exam_app.py")],
    pathex=[SPECPATH],
    binaries=[],
    datas=DATAS,
    hiddenimports=[],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    exclude_binaries=True,
    name="ccaf-practice-exam",
    console=False,
    upx=False,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    name="ccaf-practice-exam",
)

app = BUNDLE(
    coll,
    name="CCA-F Practice Exam.app",
    icon=None,
    bundle_identifier="com.tfurland.ccaf-practice-exam",
    info_plist={
        "NSHighResolutionCapable": True,
        "CFBundleShortVersionString": "1.0.0",
    },
)
