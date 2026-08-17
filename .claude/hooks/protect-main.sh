#!/bin/bash
# PreToolUse guard: stop Claude destroying or unprotecting main.
#
# GitHub branch protection on this repo deliberately does NOT apply to admins,
# so the repo owner can still push directly to main. That bypass is inherited by
# any Claude session running as the owner — which means the one thing branch
# protection cannot defend against is an agent acting with the owner's
# credentials. This hook is that missing half.
#
# Blocks (exit 2):
#   - force-pushing main, in any spelling: --force, -f, --force-with-lease,
#     or a leading-plus refspec
#   - deleting main, via --delete or an empty-source refspec
#   - hard-resetting main locally, which is how a force-push usually starts
#   - removing or weakening the branch protection itself
#
# Deliberately does NOT block ordinary pushes to main. The owner works that way
# and the protection is configured to allow it; a guard that also blocked normal
# work would be turned off within a day.
#
# Fails CLOSED for pushes when jq is missing: a guard that silently no-ops is
# worse than no guard, because it is trusted.

INPUT=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  if echo "$INPUT" | grep -Eq 'git ([^"]* )?push|branches/[^ ]*/protection'; then
    echo "BLOCKED: protect-main needs jq to inspect this command (brew install jq)." \
         "Refusing to let a push or a protection change through unchecked." >&2
    exit 2
  fi
  exit 0
fi

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[ -z "$CMD" ] && exit 0

# Collapse whitespace so "git   push  --force" reads the same as the tidy form.
FLAT=$(printf '%s' "$CMD" | tr '\n' ' ' | tr -s ' ')

deny() {
  echo "BLOCKED by .claude/hooks/protect-main.sh: $1" >&2
  echo "" >&2
  echo "main is protected against history loss. Branch protection exempts admins," \
       "so this repo relies on this hook to stop an agent using those rights." >&2
  echo "If this is genuinely intended, run it yourself outside Claude." >&2
  exit 2
}

# --- Force-pushing main -------------------------------------------------
# Matched on the command as a whole rather than parsed: a push can name the
# branch before or after the flag, and can spell force four different ways.
case "$FLAT" in
  *"git push"*|*"git -C "*" push"*)
    # Read the refspec rather than scanning the whole command for "main". The
    # positional arguments after `push`, flags stripped, are <remote> <refspec>.
    # Shell parameter expansion rather than sed: BSD sed (macOS) does not
    # support \? for an optional group, so a portable-looking sed silently
    # failed to strip anything and every push read as targeting a branch called
    # "push". A guard that quietly stops guarding is the worst outcome here.
    case "$FLAT" in
      *"push "*) ARGS=${FLAT#*push } ;;
      *)         ARGS="" ;;
    esac
    # shellcheck disable=SC2086  # deliberate word splitting into arguments
    REFSPEC=$(printf '%s\n' $ARGS | grep -v '^-' | sed -n '2p')

    if [ -z "$REFSPEC" ]; then
      # No refspec: this pushes the current branch to its upstream, which may
      # well be main. Assume the worst — being wrong here costs one blocked
      # command, being wrong the other way costs history.
      TARGETS_MAIN=1
    else
      TARGETS_MAIN=0
      case "$REFSPEC" in
        *main*) TARGETS_MAIN=1 ;;
      esac
    fi

    if [ "$TARGETS_MAIN" = "1" ]; then
      case "$FLAT" in
        *" --force-with-lease"*|*" --force"*|*" -f "*|*" -f")
          deny "this force-pushes main, which rewrites published history." ;;
        *" +main"*|*" +HEAD:main"*|*":+main"*)
          deny "a leading-plus refspec is a force push, and this one targets main." ;;
      esac
      case "$FLAT" in
        *" --delete"*|*" -d "*|*" :main"*|*" origin :"*)
          deny "this deletes main on the remote." ;;
      esac
    fi
    ;;
esac

# --- Destroying local main ----------------------------------------------
case "$FLAT" in
  *"git branch -D main"*|*"git branch --delete --force main"*)
    deny "this force-deletes the local main branch." ;;
  *"git reset --hard"*)
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    [ "$BRANCH" = "main" ] && \
      deny "a hard reset on main discards commits and is how an accidental force-push begins."
    ;;
esac

# --- Removing the guardrail itself --------------------------------------
# Weakening protection is the same act as destroying history, one step earlier.
case "$FLAT" in
  *"branches/main/protection"*)
    case "$FLAT" in
      *"-X DELETE"*|*"--method DELETE"*|*"-X PUT"*|*"--method PUT"*|*"-X PATCH"*|*"--method PATCH"*)
        deny "this changes or removes branch protection on main." ;;
    esac
    ;;
  *"allow_force_pushes"*|*"allow_deletions"*)
    deny "this alters whether main can be force-pushed or deleted." ;;
esac

exit 0
