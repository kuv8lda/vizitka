#!/usr/bin/env python3
"""Local static preview server; run with python3 serve.py."""

import argparse
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEVTOOLS_PATH = "/.well-known/appspecific/com.chrome.devtools.json"


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            # Reloading a page or cancelling video playback can close the socket.
            pass

    def do_GET(self):
        if self.path.split("?", 1)[0] == DEVTOOLS_PATH:
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return
        super().do_GET()

    def do_HEAD(self):
        if self.path.split("?", 1)[0] == DEVTOOLS_PATH:
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return
        super().do_HEAD()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    with ThreadingHTTPServer((args.bind, args.port), PreviewHandler) as server:
        print(f"Serving {ROOT} at http://{args.bind}:{args.port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
