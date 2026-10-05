import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path


def request(base_url, endpoint, data=None):
    payload = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(
        base_url + endpoint,
        data=payload,
        headers={"Content-Type": "application/json"} if payload else {},
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.load(response)


def wait_for_startup(base_url):
    deadline = time.monotonic() + 60
    while True:
        try:
            return request(base_url, "/api/prd")
        except (urllib.error.URLError, TimeoutError):
            if time.monotonic() >= deadline:
                raise
            time.sleep(1)


def verify_document(base_url, document):
    detail = request(base_url, "/api/prd/" + document["id"])["prd"]
    if detail["title"] != document["title"]:
        raise RuntimeError("PRD detail did not retain the saved title")
    listed = request(base_url, "/api/prd")["prds"]
    if not any(prd["id"] == document["id"] for prd in listed):
        raise RuntimeError("Saved PRD is missing from the document list")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("phase", choices=["create", "verify"])
    parser.add_argument("state", type=Path)
    parser.add_argument("--base-url", default="http://127.0.0.1:3000")
    args = parser.parse_args()
    wait_for_startup(args.base_url)
    if args.phase == "create":
        document = request(
            args.base_url,
            "/api/prd",
            {"title": "Self-host persistence smoke test", "language": "ID", "mode": "ONESHOT"},
        )["prd"]
        args.state.write_text(json.dumps({"id": document["id"], "title": document["title"]}))
        verify_document(args.base_url, document)
        print("PASS: self-host creates and lists a PRD without login or subscription")
    else:
        verify_document(args.base_url, json.loads(args.state.read_text()))
        print("PASS: saved PRD survives container recreation using the SQLite volume")


if __name__ == "__main__":
    main()
