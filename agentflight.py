import argparse
import ast
import datetime
import glob
import os
import subprocess
import sys
from typing import Dict, List, Set


class TestIntegrityAuditor:
    """Parses Python test files to detect assertion deletion or tampering."""

    @staticmethod
    def extract_assertions(code_str: str) -> Set[str]:
        assertions = set()
        try:
            tree = ast.parse(code_str)
        except SyntaxError:
            return assertions

        for node in ast.walk(tree):
            if isinstance(node, ast.Assert):
                assertions.add(ast.unparse(node))
            elif isinstance(node, ast.With):
                for item in node.items:
                    expr_str = ast.unparse(item.context_expr)
                    if "raises" in expr_str:
                        assertions.add(f"with {expr_str}")

        return assertions

    def audit_step(self, file_path: str, old_code: str, new_code: str) -> Dict:
        old_asserts = self.extract_assertions(old_code)
        new_asserts = self.extract_assertions(new_code)
        deleted_asserts = old_asserts - new_asserts
        tampering_detected = len(deleted_asserts) > 0

        return {
            "file": file_path,
            "tampered": tampering_detected,
            "deleted_assertions": list(deleted_asserts),
            "status": "FLAGGED_SUSPICIOUS" if tampering_detected else "CLEAN",
        }


def log_command(command: str):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] Executing: {command}")


def get_git_tree_hash() -> str:
    try:
        result = subprocess.run(
            ["git", "write-tree"], capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except Exception:
        return "Not a git repository"


def get_file_content(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return ""


def discover_test_files() -> List[str]:
    """Finds all test files in the workspace matching test_*.py or *_test.py."""
    files = glob.glob("**/test_*.py", recursive=True) + glob.glob(
        "**/*_test.py", recursive=True
    )
    # Ignore virtual environments or hidden directories
    return [
        f
        for f in set(files)
        if not f.startswith(".")
        and "site-packages" not in f
        and "venv" not in f
    ]


def run_agent_command(command_list: List[str]) -> int:
    command_str = " ".join(command_list)
    auditor = TestIntegrityAuditor()
    test_files = discover_test_files()

    # 1. Snapshot test contents before execution
    before_code = {fp: get_file_content(fp) for fp in test_files}
    before_hash = get_git_tree_hash()

    print(f"Target test files: {test_files}")
    print(f"State Before: {before_hash}")
    log_command(command_str)

    # 2. Run the command
    result = subprocess.run(
        command_list, capture_output=True, text=True, shell=False
    )
    print(f"STDOUT:\n{result.stdout}")
    if result.stderr:
        print(f"STDERR:\n{result.stderr}")
    print(f"Command Exit Code: {result.returncode}")

    after_hash = get_git_tree_hash()
    print(f"State After: {after_hash}")

    # 3. Post-execution audit
    tampering_found = False
    if test_files:
        print("\n--- Integrity Audit Report ---")
        for fp in test_files:
            current_code = get_file_content(fp)
            report = auditor.audit_step(fp, before_code[fp], current_code)
            print(f"File: {report['file']}")
            print(f"Status: {report['status']}")
            if report["tampered"]:
                tampering_found = True
                print("  [ALERT] Critical assertions removed during execution!")
                for statement in report["deleted_assertions"]:
                    print(f"  [DELETED] -> {statement}")

    if tampering_found:
        print("\n[FAIL] Audit failed: Test tampering detected.")
        return 2

    return result.returncode


def main():
    parser = argparse.ArgumentParser(
        description="AgentFlight CLI: Audit agent actions for test tampering"
    )
    parser.add_argument(
        "command",
        nargs=argparse.REMAINDER,
        help="The command to execute and audit",
    )

    args = parser.parse_args()

    if not args.command:
        # Default test command when run without arguments
        command = ["python", "-m", "pytest"]
    else:
        command = args.command

    exit_code = run_agent_command(command)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()