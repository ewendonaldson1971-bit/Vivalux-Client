import http.server
import os
import socketserver


ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "0.0.0.0"
PORT = 5173


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


os.chdir(ROOT)

with socketserver.TCPServer((HOST, PORT), QuietHandler) as httpd:
    httpd.serve_forever()
