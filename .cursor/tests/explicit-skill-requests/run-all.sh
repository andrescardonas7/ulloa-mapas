#!/bin/bash
# Run all explicit skill request tests
# Usage: ./run-all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS_DIR="$SCRIPT_DIR/prompts"

echo "=== Running All Explicit Skill Request Tests ==="
echo ""

PASSED=0
FAILED=0
RESULTS=()

# Test: subagent-driven-development, please
echo ">>> Test 1: subagent-driven-development-please"
if "$SCRIPT_DIR/run-test.sh" "subagent-driven-development" "$PROMPTS_DIR/subagent-driven-development-please.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS+=("PASS: subagent-driven-development-please")
else
    FAILED=$((FAILED + 1))
    RESULTS+=("FAIL: subagent-driven-development-please")
fi
echo ""

# Test: use systematic-debugging
echo ">>> Test 2: use-systematic-debugging"
if "$SCRIPT_DIR/run-test.sh" "systematic-debugging" "$PROMPTS_DIR/use-systematic-debugging.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS+=("PASS: use-systematic-debugging")
else
    FAILED=$((FAILED + 1))
    RESULTS+=("FAIL: use-systematic-debugging")
fi
echo ""

# Test: please use brainstorming
echo ">>> Test 3: please-use-brainstorming"
if "$SCRIPT_DIR/run-test.sh" "brainstorming" "$PROMPTS_DIR/please-use-brainstorming.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS+=("PASS: please-use-brainstorming")
else
    FAILED=$((FAILED + 1))
    RESULTS+=("FAIL: please-use-brainstorming")
fi
echo ""

# Test: mid-conversation execute plan
echo ">>> Test 4: mid-conversation-execute-plan"
if "$SCRIPT_DIR/run-test.sh" "subagent-driven-development" "$PROMPTS_DIR/mid-conversation-execute-plan.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS+=("PASS: mid-conversation-execute-plan")
else
    FAILED=$((FAILED + 1))
    RESULTS+=("FAIL: mid-conversation-execute-plan")
fi
echo ""

echo "=== Summary ==="
for result in "${RESULTS[@]}"; do
    echo "  $result"
done
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

if [ "$FAILED" -gt 0 ]; then
    exit 1
fi
