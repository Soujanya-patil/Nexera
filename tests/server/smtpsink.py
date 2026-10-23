# A minimal local SMTP sink for testing PHP mail(): accepts every message and appends it to mails.log.
import socket, threading, sys, os

LOG = os.environ.get("MAILS") or os.path.join(os.getcwd(), "mails.log")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 2525

def handle(c):
    f = c.makefile("rb")
    send = lambda s: c.sendall((s + "\r\n").encode())
    send("220 sink ready")
    data = None
    while True:
        line = f.readline()
        if not line:
            break
        if data is not None:
            if line in (b".\r\n", b".\n"):
                with open(LOG, "ab") as out:
                    out.write(b"----- MESSAGE -----\n" + b"".join(data) + b"\n")
                data = None
                send("250 queued")
            else:
                data.append(line)
            continue
        cmd = line.decode(errors="replace").strip().upper()
        if cmd.startswith("DATA"):
            data = []
            send("354 go")
        elif cmd.startswith("QUIT"):
            send("221 bye")
            break
        else:
            send("250 ok")
    c.close()

s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(("127.0.0.1", PORT))
s.listen(5)
while True:
    conn, _ = s.accept()
    threading.Thread(target=handle, args=(conn,), daemon=True).start()
